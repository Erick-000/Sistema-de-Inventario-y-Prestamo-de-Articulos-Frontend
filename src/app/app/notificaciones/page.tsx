"use client";

import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";
import { NotificationDetailsModal } from "@/components/NotificationDetailsModal";
import { useAppState } from "@/state/app-state";
import { apiFetch } from "@/lib/api/client";
import { formatDateISO } from "@/lib/ui/format";
import type { Notification } from "@/lib/types/notifications";
import { useState } from "react";

function typeLabel(t: string) {
  switch (t) {
    case "OVERDUE":   return "Vencido";
    case "REQUEST":   return "Solicitud";
    case "INVENTORY": return "Inventario";
    default:          return "Sistema";
  }
}

function typeBadge(t: string): "overdue" | "pending" | "approved" | "returned" {
  switch (t) {
    case "OVERDUE":   return "overdue";
    case "REQUEST":   return "pending";
    case "INVENTORY": return "approved";
    default:          return "returned";
  }
}

function typeIcon(t: string) {
  switch (t) {
    case "OVERDUE":
      return (
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    case "REQUEST":
      return (
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12h6M9 16h6M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
        </svg>
      );
    case "INVENTORY":
      return (
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
  }
}

export default function NotificacionesPage() {
  const { state, reload } = useAppState();
  const [selected, setSelected] = useState<Notification | null>(null);

  const unread = state.notifications.filter((n) => !n.read).length;

  async function markRead(id: string) {
    await apiFetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    await reload();
  }

  async function markAllRead() {
    await apiFetch("/api/notifications/read-all", { method: "PATCH" });
    await reload();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notificaciones"
        description="Avisos del sistema y eventos relevantes."
        right={
          <Button variant="ghost" onClick={() => { void markAllRead(); }} disabled={unread === 0}>
            Marcar todas como leídas
          </Button>
        }
      />

      {state.notifications.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-black/[0.01] p-12 text-center">
          <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-black/[0.04] text-black/40">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </span>
          <div className="text-sm font-semibold text-black/70">Sin notificaciones</div>
          <div className="mt-1 text-xs text-black/50">No tienes avisos pendientes por el momento.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {state.notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-4 rounded-2xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                n.read
                  ? "border-black/10 bg-white"
                  : "border-uniclaretiana-yellow/40 bg-uniclaretiana-yellow/[0.03]"
              }`}
            >
              {/* Icon */}
              <span
                className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  n.type === "OVERDUE"
                    ? "bg-red-100 text-red-600"
                    : n.type === "REQUEST"
                      ? "bg-yellow-50 text-yellow-700"
                      : "bg-black/[0.04] text-black/60"
                }`}
              >
                {typeIcon(n.type)}
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-black">{n.title}</span>
                  <Badge variant={typeBadge(n.type)}>{typeLabel(n.type)}</Badge>
                  {!n.read && (
                    <span className="inline-flex h-2 w-2 rounded-full bg-uniclaretiana-yellow" />
                  )}
                </div>
                <p className="mt-1 line-clamp-1 text-xs text-black/60">{n.message}</p>
                <div className="mt-1 text-[10px] font-bold text-black/40">{formatDateISO(n.createdAt.slice(0, 10))}</div>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 flex-col items-end gap-2">
                <button
                  type="button"
                  className="text-[10px] font-semibold text-black underline-offset-2 hover:underline"
                  onClick={() => setSelected(n)}
                >
                  Ver detalle
                </button>
                {!n.read && (
                  <button
                    type="button"
                    className="text-[10px] font-semibold text-black/50 underline-offset-2 hover:underline"
                    onClick={() => { void markRead(n.id); }}
                  >
                    Marcar leída
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <NotificationDetailsModal
        notification={selected}
        onClose={() => setSelected(null)}
        onMarkRead={selected ? () => { void markRead(selected.id); } : undefined}
      />
    </div>
  );
}
