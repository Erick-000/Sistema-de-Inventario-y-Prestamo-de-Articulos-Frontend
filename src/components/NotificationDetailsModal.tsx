"use client";

import { Modal } from "@/components/Modal";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import type { Notification } from "@/lib/types/notifications";
import { formatDateISO } from "@/lib/ui/format";

function typeLabel(t: string) {
  switch (t) {
    case "OVERDUE":   return "Préstamo vencido";
    case "REQUEST":   return "Solicitud";
    case "INVENTORY": return "Inventario";
    default:          return "Sistema";
  }
}

function typeBadgeVariant(t: string): "overdue" | "pending" | "approved" | "returned" {
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
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      );
    case "REQUEST":
      return (
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12h6M9 16h6M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
        </svg>
      );
    case "INVENTORY":
      return (
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      );
  }
}

export function NotificationDetailsModal({
  notification,
  onClose,
  onMarkRead,
}: {
  notification: Notification | null;
  onClose: () => void;
  onMarkRead?: () => void;
}) {
  return (
    <Modal
      open={!!notification}
      title="Detalle de notificación"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cerrar</Button>
          {notification && !notification.read && onMarkRead && (
            <Button variant="secondary" onClick={() => { onMarkRead(); onClose(); }}>
              Marcar como leída
            </Button>
          )}
        </>
      }
    >
      {notification && (
        <div className="space-y-5">
          {/* Icon + type header */}
          <div className="flex items-center gap-4 rounded-2xl border border-black/10 bg-black/[0.015] p-4">
            <span
              className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                notification.type === "OVERDUE"
                  ? "bg-red-100 text-red-600"
                  : notification.type === "REQUEST"
                    ? "bg-yellow-50 text-yellow-700"
                    : "bg-black/[0.04] text-black/60"
              }`}
            >
              {typeIcon(notification.type)}
            </span>
            <div className="flex-1">
              <div className="text-sm font-bold text-black">{notification.title}</div>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant={typeBadgeVariant(notification.type)}>
                  {typeLabel(notification.type)}
                </Badge>
                <Badge variant={notification.read ? "returned" : "pending"}>
                  {notification.read ? "Leída" : "Nueva"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="rounded-xl border border-black/10 p-4">
            <div className="text-[9px] font-bold uppercase tracking-widest text-black/40">Mensaje</div>
            <p className="mt-2 text-sm leading-relaxed text-black/80">{notification.message}</p>
          </div>

          {/* Date */}
          <div className="flex items-center justify-between rounded-xl bg-black/[0.02] px-4 py-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-black/40">Fecha</span>
            <span className="text-sm font-semibold text-black">
              {formatDateISO(notification.createdAt.slice(0, 10))}
            </span>
          </div>
        </div>
      )}
    </Modal>
  );
}
