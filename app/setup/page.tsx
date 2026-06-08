"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/app/context/AuthContext";

export default function SetupPage() {
  const [status, setStatus] = useState<"idle" | "creating" | "success" | "exists" | "error">("idle");
  const [message, setMessage] = useState("");
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && profile) {
      router.push("/admin");
    }
  }, [user, profile, loading, router]);

  const handleSetup = async () => {
    setStatus("creating");
    setMessage("Creando usuario...");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        "jhr@dev09.com",
        "Ibarra_09"
      );

      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: "jhr@dev09.com",
        nombre: "Jesher",
        createdAt: new Date().toISOString(),
        lastSeen: null,
      });

      setStatus("success");
      setMessage("Usuario creado exitosamente. Redirigiendo al admin...");

      setTimeout(() => {
        router.push("/admin");
      }, 1500);
    } catch (err: unknown) {
      const errorMsg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : "";

      if (errorMsg.includes("email-already-exists") || errorMsg.includes("email-already-in-use")) {
        setStatus("exists");
        setMessage("El usuario ya existe. Inicia sesión en la pantalla de login.");
      } else {
        setStatus("error");
        setMessage(`Error: ${errorMsg}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: "#0a0a0f" }}>
        <div className="text-[11px] tracking-[0.15em] uppercase text-white/30" style={{ fontFamily: "'Space Mono', monospace" }}>
          Cargando...
        </div>
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden" style={{ background: "#0a0a0f" }}>
      {/* Ambient gradient */}
      <div className="pointer-events-none absolute inset-0 z-0" style={{
        background: "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(139,92,246,0.08) 0%, transparent 70%)",
      }} />

      <div className="relative z-10 w-full max-w-sm px-6">
        <div className="mb-8 text-center">
          <img src="/logo.svg" alt="P" className="mx-auto mb-4 h-16 w-16" />
          <p className="mb-2 text-[10px] tracking-[0.18em] uppercase" style={{ fontFamily: "'Space Mono', monospace", color: "rgba(167,139,250,0.4)" }}>
            // configuración inicial
          </p>
          <h2 className="text-xl font-medium tracking-tight text-white">
            Configurar Usuario
          </h2>
        </div>

        {status === "idle" && (
          <div className="rounded-lg border px-5 py-4" style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)" }}>
            <p className="mb-4 text-sm text-white/60" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Se creará el usuario <strong className="text-white">jhr@dev09.com</strong> con acceso al panel de videos.
            </p>
            <button
              onClick={handleSetup}
              className="w-full rounded-lg py-3 text-xs font-bold uppercase tracking-[0.12em] text-[#050509] transition hover:brightness-110"
              style={{
                fontFamily: "'Space Mono', monospace",
                background: "#8b5cf6",
                boxShadow: "0 0 24px rgba(139,92,246,0.2)",
              }}
            >
              Crear Usuario →
            </button>
          </div>
        )}

        {status === "creating" && (
          <div className="rounded-lg border px-5 py-6 text-center" style={{ borderColor: "rgba(139,92,246,0.15)", background: "rgba(139,92,246,0.03)" }}>
            <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
            <p className="text-sm text-white/60">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="rounded-lg border px-5 py-6 text-center" style={{ borderColor: "rgba(139,92,246,0.2)", background: "rgba(139,92,246,0.04)" }}>
            <p className="mb-1 text-lg text-violet-400">✓</p>
            <p className="text-sm text-white/80">{message}</p>
          </div>
        )}

        {status === "exists" && (
          <div className="rounded-lg border px-5 py-6 text-center" style={{ borderColor: "rgba(255,183,0,0.2)", background: "rgba(255,183,0,0.04)" }}>
            <p className="mb-1 text-lg text-[#ffc107]">!</p>
            <p className="mb-4 text-sm text-white/80">{message}</p>
            <button
              onClick={() => router.push("/login")}
              className="w-full rounded-lg py-3 text-xs font-bold uppercase tracking-[0.12em] text-[#050509] transition hover:brightness-110"
              style={{
                fontFamily: "'Space Mono', monospace",
                background: "#8b5cf6",
                boxShadow: "0 0 24px rgba(139,92,246,0.2)",
              }}
            >
              Ir al Login →
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="rounded-lg border px-5 py-6 text-center" style={{ borderColor: "rgba(255,77,77,0.2)", background: "rgba(255,77,77,0.04)" }}>
            <p className="mb-1 text-lg text-red-400">✕</p>
            <p className="mb-4 text-sm text-red-300">{message}</p>
            <button
              onClick={() => setStatus("idle")}
              className="w-full rounded-lg py-3 text-xs font-bold uppercase tracking-[0.12em] text-[#050509] transition hover:brightness-110"
              style={{
                fontFamily: "'Space Mono', monospace",
                background: "#8b5cf6",
                boxShadow: "0 0 24px rgba(139,92,246,0.2)",
              }}
            >
              Reintentar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
