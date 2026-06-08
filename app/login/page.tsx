"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40">
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/40">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7c.78 0 1.53-.09 2.24-.26" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { user, profile, login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user && profile) {
      router.push("/admin");
    }
  }, [user, profile, loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: unknown) {
      const errorMsg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message?: unknown }).message)
          : "Error al iniciar sesión";

      if (errorMsg.includes("invalid-credential") || errorMsg.includes("wrong-password")) {
        setError("Correo o contraseña incorrectos.");
      } else if (errorMsg.includes("user-not-found")) {
        setError("Usuario no encontrado.");
      } else {
        setError("Error al iniciar sesión. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden md:flex-row" style={{ background: "#0a0a0f", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Ambient gradient */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 20% 40%, rgba(139,92,246,0.08) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 60%, rgba(167,139,250,0.05) 0%, transparent 50%)",
        }}
      />

      <a
        href="/"
        className="absolute left-6 top-6 z-20 rounded-lg border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/30 transition hover:border-violet-500/30 hover:text-violet-400"
        style={{ fontFamily: "'Space Mono', monospace", borderColor: "rgba(255,255,255,0.08)" }}
      >
        ← Volver
      </a>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-8 md:items-start md:justify-center md:pl-14 md:py-0">
        <p className="mb-4 text-xs tracking-[0.2em] uppercase" style={{ fontFamily: "'Space Mono', monospace", color: "rgba(167,139,250,0.45)" }}>
          // panel de administración
        </p>
        <img src="/logo.svg" alt="P" className="mb-4 h-32 w-32 md:h-48 md:w-48" />
        <p className="mt-5 text-xs tracking-[0.12em] uppercase" style={{ color: "rgba(255,255,255,0.2)" }}>
          Admin Access
        </p>
        <div className="mt-7 flex items-center gap-2">
          <div className="h-[5px] w-[5px] rounded-full" style={{ background: "#8b5cf6", boxShadow: "0 0 6px rgba(139,92,246,0.6)", animation: "pulse 2s ease-in-out infinite" }} />
          <span className="text-[10px] tracking-[0.1em] uppercase" style={{ fontFamily: "'Space Mono', monospace", color: "rgba(167,139,250,0.35)" }}>
            Solo Administrador
          </span>
        </div>
      </div>

      <div className="relative z-10 hidden h-full w-px md:block" style={{ background: "linear-gradient(to bottom, transparent 0%, rgba(139,92,246,0.08) 20%, rgba(139,92,246,0.15) 50%, rgba(139,92,246,0.08) 80%, transparent 100%)" }} />

      <div className="relative z-10 flex h-auto w-full items-center justify-center px-6 py-6 md:h-full md:w-[340px] md:px-9 md:py-0" style={{ background: "rgba(255,255,255,0.016)" }}>
        <div className="w-full">
          <div className="mb-8">
            <p className="mb-2 text-[10px] tracking-[0.18em] uppercase" style={{ fontFamily: "'Space Mono', monospace", color: "rgba(167,139,250,0.4)" }}>
              // acceso
            </p>
            <h2 className="text-xl font-medium tracking-tight text-white">Iniciar sesión</h2>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-[11px] text-red-300">{error}</div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-[11px] uppercase tracking-[0.06em] text-white/30">Correo electrónico</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full rounded-lg border bg-white/[0.03] px-4 py-[11px] text-sm text-white placeholder-white/20 outline-none transition focus:border-violet-500/50"
                style={{ borderColor: "rgba(255,255,255,0.08)" }} placeholder="jhr@dev09.com" />
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] uppercase tracking-[0.06em] text-white/30">Contraseña</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                  className="w-full rounded-lg border bg-white/[0.03] px-4 py-[11px] pr-10 text-sm text-white placeholder-white/20 outline-none transition focus:border-violet-500/50"
                  style={{ borderColor: "rgba(255,255,255,0.08)" }} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition hover:text-white/70"><EyeIcon open={showPassword} /></button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full rounded-lg py-3 text-xs font-bold uppercase tracking-[0.12em] text-[#050509] transition"
              style={{ fontFamily: "'Space Mono', monospace", background: "#8b5cf6", boxShadow: "0 0 24px rgba(139,92,246,0.2)" }}>
              {loading ? "Verificando..." : "Entrar →"}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-center gap-2">
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
            <div className="h-1 w-1 rounded-full" style={{ background: "rgba(139,92,246,0.25)" }} />
            <span className="text-[11px] tracking-[0.04em]" style={{ color: "rgba(255,255,255,0.2)" }}>P</span>
            <div className="h-1 w-1 rounded-full" style={{ background: "rgba(139,92,246,0.25)" }} />
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
