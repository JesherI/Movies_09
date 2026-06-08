"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  extractVideoId,
  getThumbnailUrl,
  fetchYouTubeMetadata,
} from "@/lib/youtube";

interface VideoEntry {
  id: string;
  url: string;
  videoId: string;
  title: string;
  thumbnailUrl: string;
  description: string;
  authorName: string;
  authorUrl: string;
  tags: string[];
  createdAt: Timestamp;
}

function PlayIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export default function Admin() {
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [videos, setVideos] = useState<VideoEntry[]>([]);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const { profile, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const q = query(
      collection(db, "videos"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: VideoEntry[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as VideoEntry);
      });
      setVideos(list);
    });

    return () => unsubscribe();
  }, []);

  const handleAdd = useCallback(async () => {
    setError("");

    if (!url.trim()) {
      setError("Ingresa un link de YouTube");
      return;
    }

    const videoId = extractVideoId(url.trim());
    if (!videoId) {
      setError("Link de YouTube inválido");
      return;
    }

    setAdding(true);

    try {
      const metadata = await fetchYouTubeMetadata(url.trim());

      await addDoc(collection(db, "videos"), {
        url: url.trim(),
        videoId,
        title: metadata?.title || "Sin título",
        thumbnailUrl: metadata?.thumbnailUrl || getThumbnailUrl(videoId),
        description: description.trim(),
        authorName: metadata?.authorName || "Desconocido",
        authorUrl: metadata?.authorUrl || "",
        tags,
        createdAt: serverTimestamp(),
      });

      setUrl("");
      setDescription("");
      setTags([]);
      setShowForm(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setError(`Error: ${msg}`);
    } finally {
      setAdding(false);
    }
  }, [url, description, tags]);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "videos", id));
      setDeleteConfirm(null);
    } catch {
      setError("Error al eliminar");
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const filteredVideos = useMemo(() => {
    if (!search.trim()) return videos;
    const term = search.toLowerCase();
    return videos.filter(
      (v) =>
        v.title.toLowerCase().includes(term) ||
        v.description.toLowerCase().includes(term) ||
        v.authorName.toLowerCase().includes(term) ||
        v.tags?.some((t) => t.toLowerCase().includes(term))
    );
  }, [videos, search]);

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleDateString("es-MX", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="relative min-h-screen" style={{ background: "#0a0a0f" }}>
      {/* Ambient gradient */}
      <div className="pointer-events-none fixed inset-0 z-0" style={{
        background: "radial-gradient(ellipse 80% 50% at 20% 40%, rgba(139,92,246,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 60%, rgba(167,139,250,0.04) 0%, transparent 50%)",
      }} />

      <header className="relative z-10 border-b px-6 py-4" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <img src="/logo.svg" alt="P" className="h-8 w-8" />
              <div>
                <p className="text-[10px] tracking-[0.15em] uppercase text-white/20" style={{ fontFamily: "'Space Mono', monospace" }}>
                  Panel de Administración
                </p>
              </div>
            </div>
            <a href="/" className="rounded-lg border px-3 py-1.5 text-[10px] uppercase tracking-[0.1em] text-white/25 transition hover:border-violet-500/30 hover:text-violet-400" style={{ fontFamily: "'Space Mono', monospace", borderColor: "rgba(255,255,255,0.08)" }}>
              Ver sitio →
            </a>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-[5px] w-[5px] rounded-full" style={{ background: "#00ff88", boxShadow: "0 0 6px rgba(0,255,136,0.6)", animation: "pulse 2s ease-in-out infinite" }} />
            <span className="text-[10px] tracking-[0.1em] uppercase text-white/20" style={{ fontFamily: "'Space Mono', monospace" }}>
              {profile?.nombre || "Admin"}
            </span>
            <button onClick={handleLogout} className="ml-2 rounded-lg p-2 text-white/30 transition hover:bg-white/[0.04] hover:text-white/60" title="Cerrar sesión">
              <LogOutIcon />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20">
              <SearchIcon />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="w-full rounded-full border bg-white/[0.03] py-2 pl-9 pr-4 text-sm text-white placeholder-white/20 outline-none transition focus:border-violet-500/50"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
            />
          </div>
          <p className="text-[10px] tracking-[0.18em] uppercase" style={{ fontFamily: "'Space Mono', monospace", color: "rgba(255,255,255,0.15)" }}>
            {filteredVideos.length} película{filteredVideos.length !== 1 ? "s" : ""}
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#050509] transition hover:brightness-110"
            style={{ fontFamily: "'Space Mono', monospace", background: "#8b5cf6", boxShadow: "0 0 24px rgba(139,92,246,0.2)" }}
          >
            <PlusIcon />
            Agregar
          </button>
        </div>

        {/* Floating Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
            <div className="relative z-10 w-full max-w-md rounded-xl border p-6" style={{ borderColor: "rgba(255,255,255,0.1)", background: "#0f0f14" }}>
              <div className="mb-5 flex items-center justify-between">
                <p className="text-[10px] tracking-[0.18em] uppercase" style={{ fontFamily: "'Space Mono', monospace", color: "rgba(167,139,250,0.5)" }}>
                  // agregar película
                </p>
                <button onClick={() => setShowForm(false)} className="rounded-lg p-1 text-white/30 transition hover:bg-white/[0.04] hover:text-white/50">
                  <XIcon />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <input type="url" value={url} onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full rounded-lg border bg-white/[0.03] px-4 py-[11px] text-sm text-white placeholder-white/20 outline-none transition focus:border-violet-500/50"
                  style={{ borderColor: "rgba(255,255,255,0.08)" }} />
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción (opcional)"
                  className="w-full rounded-lg border bg-white/[0.03] px-4 py-[11px] text-sm text-white placeholder-white/20 outline-none transition focus:border-violet-500/50"
                  style={{ borderColor: "rgba(255,255,255,0.08)" }} />
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, i) => (
                      <span key={i} className="flex items-center gap-1 rounded-full px-3 py-1 text-[11px]" style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa" }}>
                        {tag}
                        <button onClick={() => setTags(tags.filter((_, idx) => idx !== i))} className="ml-1 text-violet-400 hover:text-white">×</button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
                        e.preventDefault();
                        const newTag = tagInput.trim().toLowerCase();
                        if (!tags.includes(newTag)) {
                          setTags([...tags, newTag]);
                        }
                        setTagInput("");
                      }
                    }}
                    placeholder="Escribe un género y presiona Enter..."
                    className="w-full rounded-lg border bg-white/[0.03] px-4 py-[11px] text-sm text-white placeholder-white/20 outline-none transition focus:border-violet-500/50"
                    style={{ borderColor: "rgba(255,255,255,0.08)" }}
                  />
                </div>

                {error && <p className="text-[11px] text-red-400">{error}</p>}

                <button onClick={handleAdd} disabled={adding}
                  className="w-full rounded-lg py-3 text-xs font-bold uppercase tracking-[0.12em] text-[#050509] transition hover:brightness-110"
                  style={{ fontFamily: "'Space Mono', monospace", background: "#8b5cf6", boxShadow: "0 0 24px rgba(139,92,246,0.2)" }}>
                  {adding ? "Guardando..." : "Agregar Película →"}
                </button>
              </div>
            </div>
          </div>
        )}

        {filteredVideos.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-[11px] tracking-[0.18em] uppercase" style={{ fontFamily: "'Space Mono', monospace", color: "rgba(255,255,255,0.15)" }}>
              {search ? "No se encontraron resultados" : "No hay películas registradas"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredVideos.map((video) => (
              <div key={video.id} className="animate-fade-in group relative overflow-hidden rounded-xl border transition hover:border-violet-500/30" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.016)" }}>
                <a href={video.url} target="_blank" rel="noopener noreferrer" className="relative block aspect-video overflow-hidden">
                  <img src={video.thumbnailUrl} alt={video.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy"
                    onError={(e) => { e.currentTarget.src = `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`; }} />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full text-white" style={{ background: "rgba(139,92,246,0.85)" }}>
                      <PlayIcon />
                    </div>
                  </div>
                </a>

                <div className="p-4">
                  <a href={video.url} target="_blank" rel="noopener noreferrer" className="block">
                    <h3 className="mb-1 text-sm font-medium leading-snug text-white transition hover:text-violet-400">{video.title}</h3>
                  </a>
                  {video.description && <p className="mb-2 text-[11px] leading-relaxed text-white/40">{video.description}</p>}
                  {video.tags && video.tags.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-1">
                      {video.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full px-2 py-0.5 text-[9px] uppercase tracking-[0.05em]"
                          style={{
                            fontFamily: "'Space Mono', monospace",
                            background: "rgba(139,92,246,0.15)",
                            color: "rgba(167,139,250,0.8)",
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] tracking-[0.05em] text-white/20" style={{ fontFamily: "'Space Mono', monospace" }}>{video.authorName}</span>
                    <span className="text-[9px] tracking-[0.08em] uppercase text-white/15" style={{ fontFamily: "'Space Mono', monospace" }}>
                      {formatDate(video.createdAt)}
                    </span>
                  </div>
                </div>

                {deleteConfirm === video.id ? (
                  <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-lg border px-3 py-1.5" style={{ borderColor: "rgba(255,77,77,0.25)", background: "rgba(255,77,77,0.08)" }}>
                    <span className="text-[10px] text-red-300" style={{ fontFamily: "'Space Mono', monospace" }}>¿Eliminar?</span>
                    <button onClick={() => handleDelete(video.id)} className="text-[10px] font-bold uppercase tracking-[0.1em] text-red-400 transition hover:text-red-300" style={{ fontFamily: "'Space Mono', monospace" }}>Sí</button>
                    <button onClick={() => setDeleteConfirm(null)} className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/40 transition hover:text-white/60" style={{ fontFamily: "'Space Mono', monospace" }}>No</button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteConfirm(video.id)} className="absolute bottom-4 right-4 rounded-lg p-1.5 text-white/15 opacity-0 transition hover:bg-white/[0.04] hover:text-red-400 group-hover:opacity-100" title="Eliminar">
                    <TrashIcon />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
