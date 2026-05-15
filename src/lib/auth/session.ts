export type SessionUser = {
  id: string;
  role: string;
  name: string;
  email: string;
  blocked?: boolean;
  debeCambiarContrasena?: boolean;
};

const TOKEN_KEY = "inventario_token";
const USER_KEY = "inventario_user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function isTokenExpired(token: string | null) {
  if (!token) return true;
  const [body] = token.split(".");
  if (!body) return true;
  try {
    const base64 = body.replaceAll("-", "+").replaceAll("_", "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const payload = JSON.parse(atob(padded)) as {
      exp?: unknown;
    };
    if (typeof payload.exp !== "number" || !Number.isFinite(payload.exp)) return false;
    return Date.now() > payload.exp;
  } catch {
    return true;
  }
}

export function setSession(token: string, user: SessionUser) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser(): SessionUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}
