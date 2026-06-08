"use client";

import { useState, useEffect, useMemo } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

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
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3" />
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

function FilmIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
      <line x1="7" y1="2" x2="7" y2="22" />
      <line x1="17" y1="2" x2="17" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="2" y1="7" x2="7" y2="7" />
      <line x1="2" y1="17" x2="7" y2="17" />
      <line x1="17" y1="7" x2="22" y2="7" />
      <line x1="17" y1="17" x2="22" y2="17" />
    </svg>
  );
}

export default function Home() {
  const [videos, setVideos] = useState<VideoEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

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
      setLoaded(true);
    }, () => {
      setLoaded(true);
    });

    return () => unsubscribe();
  }, []);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    videos.forEach((v) => v.tags?.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [videos]);

  const filteredVideos = useMemo(() => {
    let result = videos;
    if (search.trim()) {
      const term = search.toLowerCase();
      result = result.filter(
        (v) =>
          v.title.toLowerCase().includes(term) ||
          v.description.toLowerCase().includes(term) ||
          v.authorName.toLowerCase().includes(term) ||
          v.tags?.some((t) => t.toLowerCase().includes(term))
      );
    }
    if (selectedTag) {
      result = result.filter((v) => v.tags?.includes(selectedTag));
    }
    return result;
  }, [videos, search, selectedTag]);

  return (
    <div className="relative min-h-screen" style={{ background: "#0a0a0f" }}>
      {/* Ambient gradient */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 20% 40%, rgba(139,92,246,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 60%, rgba(167,139,250,0.04) 0%, transparent 50%)",
        }}
      />

      {/* Header */}
      <header className="relative z-10 border-b px-6 py-4" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="P" className="h-8 w-8" />
          </div>
          
          <div className="relative flex-1 max-w-md">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20">
              <SearchIcon />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar películas..."
              className="w-full rounded-full border bg-white/[0.03] py-2 pl-9 pr-4 text-sm text-white placeholder-white/20 outline-none transition focus:border-violet-500/50"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
            />
          </div>

          <a
            href="/login"
            className="rounded-lg border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/40 transition hover:border-violet-500/30 hover:text-violet-400"
            style={{ fontFamily: "'Space Mono', monospace", borderColor: "rgba(255,255,255,0.08)" }}
          >
            Admin
          </a>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6 py-8">
        {/* Tags filter */}
        {allTags.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTag(null)}
              className="rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.08em] transition"
              style={{
                fontFamily: "'Space Mono', monospace",
                borderColor: selectedTag === null ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.08)",
                color: selectedTag === null ? "#a78bfa" : "rgba(255,255,255,0.3)",
                background: selectedTag === null ? "rgba(139,92,246,0.1)" : "transparent",
              }}
            >
              Todas
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                className="rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.08em] transition"
                style={{
                  fontFamily: "'Space Mono', monospace",
                  borderColor: selectedTag === tag ? "rgba(139,92,246,0.4)" : "rgba(255,255,255,0.08)",
                  color: selectedTag === tag ? "#a78bfa" : "rgba(255,255,255,0.3)",
                  background: selectedTag === tag ? "rgba(139,92,246,0.1)" : "transparent",
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {!loaded ? (
          <div className="flex items-center justify-center py-24">
            <div
              className="h-5 w-5 animate-spin rounded-full border-2"
              style={{ borderColor: "rgba(139,92,246,0.2)", borderTopColor: "#8b5cf6" }}
            />
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <FilmIcon />
            <p
              className="mt-4 text-[11px] tracking-[0.18em] uppercase"
              style={{ fontFamily: "'Space Mono', monospace", color: "rgba(255,255,255,0.12)" }}
            >
              {search || selectedTag ? "No se encontraron resultados" : "No hay películas aún"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredVideos.map((video, i) => (
                <a
                  key={video.id}
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-video overflow-hidden rounded-xl border transition hover:border-violet-500/30"
                  style={{
                    borderColor: "rgba(255,255,255,0.06)",
                    background: "rgba(255,255,255,0.02)",
                    animation: `fade-in 0.4s ease-out ${i * 0.05}s forwards`,
                    opacity: 0,
                  }}
                >
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.src = `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;
                    }}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-full text-white transition-transform group-hover:scale-110"
                      style={{ background: "rgba(139,92,246,0.85)" }}
                    >
                      <PlayIcon />
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-sm font-medium leading-snug text-white drop-shadow-lg">
                      {video.title}
                    </h3>
                    {video.description && (
                      <p className="mt-1 text-[10px] text-white/50 line-clamp-2">
                        {video.description}
                      </p>
                    )}
                    {video.tags && video.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
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
                    <p
                      className="mt-2 text-[9px] tracking-[0.1em] uppercase text-white/25"
                      style={{ fontFamily: "'Space Mono', monospace" }}
                    >
                      {video.authorName}
                    </p>
                  </div>
                </a>
              ))}
            </div>

            <div className="mt-10 text-center">
              <span
                className="text-[10px] tracking-[0.15em] uppercase"
                style={{ fontFamily: "'Space Mono', monospace", color: "rgba(255,255,255,0.1)" }}
              >
                {filteredVideos.length} película{filteredVideos.length !== 1 ? "s" : ""}
              </span>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
