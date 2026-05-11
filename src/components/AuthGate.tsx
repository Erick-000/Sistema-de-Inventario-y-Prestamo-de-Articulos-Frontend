"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getToken } from "@/lib/auth/session";

export function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    Promise.resolve().then(() => {
      const t = getToken();
      setToken(t);

      if (!t) {
        const next = encodeURIComponent(pathname || "/app/dashboard");
        router.replace(`/login?next=${next}`);
      }
    });
  }, [pathname, router]);

  if (!token) return null;
  return children;
}
