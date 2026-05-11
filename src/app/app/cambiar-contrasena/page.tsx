"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api/client";
import { clearSession } from "@/lib/auth/session";

export default function CambiarContrasenaPage() {
  const router = useRouter();
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (nueva.length < 6) {
      setError("La nueva contrasena debe tener al menos 6 caracteres");
      return;
    }

    if (nueva !== confirmar) {
      setError("Las contrasenas no coinciden");
      return;
    }

    try {
      await apiFetch("/api/auth/cambiar-contrasena", {
        method: "PATCH",
        body: JSON.stringify({ actual, nueva }),
      });
      setSuccess(true);
      clearSession();
      setTimeout(() => router.push("/login"), 2500);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al cambiar contrasena";
      setError(msg);
    }
  }

  if (success) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-7 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-black">Contrasena cambiada</h2>
          <p className="mt-2 text-sm text-black/60">
            Por seguridad, debes iniciar sesion nuevamente.
          </p>
          <p className="mt-1 text-xs text-black/40">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-10">
      <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-7 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold text-black">Cambiar contrasena</h2>
        <p className="mb-5 text-sm text-black/60">
          Por seguridad, debes cambiar tu contrasena antes de continuar.
        </p>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-black/80">
              Contrasena actual
            </label>
            <input type="password" value={actual} onChange={(e) => setActual(e.target.value)} required
              className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm outline-none focus:border-black/40"
              placeholder="Contrasena temporal" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-black/80">
              Nueva contrasena
            </label>
            <input type="password" value={nueva} onChange={(e) => setNueva(e.target.value)} required minLength={6}
              className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm outline-none focus:border-black/40"
              placeholder="Minimo 6 caracteres" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-black/80">
              Confirmar nueva contrasena
            </label>
            <input type="password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} required minLength={6}
              className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm outline-none focus:border-black/40"
              placeholder="Repite la nueva contrasena" />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
          )}

          <button type="submit"
            className="w-full rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-black/80">
            Cambiar contrasena
          </button>
        </form>
      </div>
    </div>
  );
}
