"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: "#0a0a0f" }}>
        <div className="text-[11px] tracking-[0.15em] uppercase text-white/30" style={{ fontFamily: "'Space Mono', monospace" }}>
          Cargando...
        </div>
      </div>
    );
  }

  if (!user || !profile) return null;

  return <>{children}</>;
}
