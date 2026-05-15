"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { clearSession, getToken, getUser, isTokenExpired } from "@/lib/auth/session";

export function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    Promise.resolve().then(() => {
      const t = getToken();

      if (!t || isTokenExpired(t)) {
        clearSession();
        const next = encodeURIComponent(pathname || "/app/dashboard");
        router.replace(`/login?next=${next}`);
        setToken(null);
        return;
      }

      const user = getUser();
      if (user?.debeCambiarContrasena && pathname !== "/app/cambiar-contrasena") {
        router.replace("/app/cambiar-contrasena");
      }

      setToken(t);
    });
  }, [pathname, router]);

  if (!token) return null;
  return children;
}
