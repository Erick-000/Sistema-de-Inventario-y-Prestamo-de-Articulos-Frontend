export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

function getBaseUrl() {
  const base = process.env.NEXT_PUBLIC_API_URL;
  return (base ?? "http://localhost:3001").replace(/\/$/, "");
}

function handleUnauthorized() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem("inventario_token");
    window.localStorage.removeItem("inventario_user");
  } catch {
    return;
  }

  const current = window.location.pathname + window.location.search;
  const next = encodeURIComponent(current || "/app/dashboard");
  if (!window.location.pathname.startsWith("/login")) {
    window.location.assign(`/login?next=${next}`);
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${getBaseUrl()}${path.startsWith("/") ? "" : "/"}${path}`;

  const token =
    typeof window !== "undefined" ? window.localStorage.getItem("inventario_token") : null;

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await res.json().catch(() => null) : await res.text().catch(() => "");

  if (!res.ok) {
    const maybeObj = typeof body === "object" && body !== null ? (body as Record<string, unknown>) : null;
    const message =
      maybeObj && "message" in maybeObj
        ? String(maybeObj.message)
        : `Request failed (${res.status})`;

    if (res.status === 401) {
      const isLogin = path === "/api/auth/login" || path.endsWith("/api/auth/login");
      if (token && !isLogin) {
        handleUnauthorized();
      }
    }
    throw new ApiError(res.status, message, body);
  }

  return body as T;
}
