"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import { setSession } from "@/lib/auth/session";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.endsWith("@miuniclaretiana.edu.co")) {
      setError("El correo debe ser @miuniclaretiana.edu.co");
      return;
    }

    try {
      const res = await apiFetch<{
        token: string;
        user: { id: string; role: string; name: string; email: string };
        debeCambiarContrasena: boolean;
      }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: normalizedEmail, password }),
      });
      setSession(res.token, res.user);

      if (res.debeCambiarContrasena) {
        router.push("/app/cambiar-contrasena");
        return;
      }
      const next = searchParams.get("next");
      if (next) {
        router.push(decodeURIComponent(next));
        return;
      }

      router.push("/app/dashboard");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Credenciales invalidas";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center bg-[radial-gradient(1200px_500px_at_20%_-10%,rgba(244,196,0,0.14),transparent_55%),radial-gradient(900px_500px_at_85%_20%,rgba(10,10,10,0.01),transparent_60%)] px-6 py-10">
      <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white/80 p-7 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="mb-6 flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border border-black/10 bg-white p-1 shadow-sm">
            <Image
              src="/unicalretiana/favicon.png"
              alt="Uniclaretiana"
              fill
              className="object-contain"
              sizes="48px"
              priority
            />
          </div>
          <div className="leading-tight">
            <div className="text-xs font-semibold tracking-widest text-black/60">
              UNICLARETIANA
            </div>
            <div className="text-lg font-semibold text-black">
              Inventario &amp; Préstamos
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4" autoComplete="on">
          <div>
            <label className="mb-1.5 block text-xs font-semibold tracking-widest text-black/60">
              CORREO INSTITUCIONAL
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              name="email"
              autoComplete="username"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
              placeholder="usuario@miuniclaretiana.edu.co"
              className="h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-sm text-black outline-none focus:border-uniclaretiana-yellow"
              pattern="^[^\s@]+@miuniclaretiana\.edu\.co$"
              title="Debe ser un correo @miuniclaretiana.edu.co"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold tracking-widest text-black/60">
              CONTRASEÑA
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-sm text-black outline-none focus:border-uniclaretiana-yellow"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 inline-flex h-11 w-full items-center justify-center rounded-xl bg-uniclaretiana-yellow text-sm font-semibold text-uniclaretiana-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>

          {error ? (
            <p className="text-center text-xs font-semibold text-red-600">{error}</p>
          ) : null}
        </form>
      </div>
    </div>
  );
}
