"use client";

import { Badge } from "@/components/Badge";
import { FilterPills } from "@/components/FilterPills";
import { PageHeader } from "@/components/PageHeader";
import { ConfirmModal } from "@/components/ConfirmModal";
import { RequestAdminActions } from "@/components/RequestAdminActions";
import { RequestDetailsModal } from "@/components/RequestDetailsModal";
import { SearchInput } from "@/components/SearchInput";
import { Table } from "@/components/Table";
import type { LoanRequest, LoanRequestStatus } from "@/lib/types/requests";
import { useAppState } from "@/state/app-state";
import { apiFetch } from "@/lib/api/client";
import { formatDateISO } from "@/lib/ui/format";
import {
  requestStatusLabel,
  requestStatusToBadgeVariant,
} from "@/lib/ui/status";
import { useMemo, useState } from "react";

const statusOptions: Array<{ value: LoanRequestStatus | "TODOS"; label: string }> = [
  { value: "TODOS", label: "Todos" },
  { value: "SOLICITADO", label: "SOLICITADO" },
  { value: "RESERVADO", label: "RESERVADO" },
  { value: "RECHAZADA", label: "Rechazada" },
  { value: "ACTIVO", label: "Activo" },
  { value: "DEVUELTO", label: "Devuelto" },
  { value: "VENCIDO", label: "Vencido" },
  { value: "CANCELADO", label: "Cancelado" },
];

const typeOptions = [
  { value: "TODOS", label: "Todos" },
  { value: "article", label: "Artículos" },
  { value: "room", label: "Salones" },
];

export default function SolicitudesPage() {
  const { state, reload } = useAppState();
  const [status, setStatus] = useState<string>(() => {
    if (typeof window === "undefined") return "TODOS";
    const value = new URLSearchParams(window.location.search).get("status");
    return value && statusOptions.some((item) => item.value === value) ? value : "TODOS";
  });
  const [type, setType] = useState<string>(() => {
    if (typeof window === "undefined") return "TODOS";
    const value = new URLSearchParams(window.location.search).get("type");
    return value && typeOptions.some((item) => item.value === value) ? value : "TODOS";
  });
  const [query, setQuery] = useState<string>("");
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [detailRequest, setDetailRequest] = useState<LoanRequest | null>(null);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();

    return [...state.requests]
      .filter((r) => (status === "TODOS" ? true : r.status === status))
      .filter((r) => (type === "TODOS" ? true : r.type === type))
      .filter((r) => {
        if (!q) return true;
        const itemsText = r.items
          .map((i) => `${i.articleName} ${i.articleSerial ?? ""} ${i.articleId}`)
          .join(" ");
        return (
          r.teacherName.toLowerCase().includes(q) ||
          r.program.toLowerCase().includes(q) ||
          itemsText.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [state.requests, status, type, query]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Solicitudes"
        description="Gestión de solicitudes de artículos y reservas de salones por estado."
        right={
          <div className="w-full md:max-w-sm">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Buscar por docente, artículo, salón, programa o ID"
            />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[auto_1fr]">
        <div className="flex flex-col gap-3">
          <div className="text-xs font-semibold tracking-widest text-black/60">TIPO</div>
          <FilterPills options={typeOptions} value={type} onChange={setType} />
        </div>
        <div className="flex flex-col gap-3">
          <div className="text-xs font-semibold tracking-widest text-black/60">ESTADO</div>
          <FilterPills options={statusOptions} value={status} onChange={setStatus} />
        </div>
      </div>

      <Table headers={["Docente", "Tipo", "Solicitud", "Inicio", "Límite", "Estado", "Nota", "Acciones"]}>
        {items.map((r) => (
          <tr key={r.id} className="hover:bg-black/[0.02]">
            <td className="px-5 py-4 align-top">
              <div className="text-sm font-semibold text-black">{r.teacherName}</div>
              <div className="mt-0.5 text-xs font-semibold tracking-widest text-black/50">
                {r.program}
              </div>
              <div className="mt-1 text-xs text-black/50">UIB-{r.id.slice(-6).toUpperCase()}</div>
              <button
                type="button"
                className="mt-2 text-[10px] font-semibold text-black underline-offset-2 hover:underline"
                onClick={() => setDetailRequest(r)}
              >
                Ver detalles
              </button>
            </td>
            <td className="px-5 py-4 align-top text-sm font-semibold text-black/70">
              {r.type === "room" ? "Salón" : "Artículo"}
            </td>
            <td className="px-5 py-4 align-top">
              <div className="space-y-1">
                {r.items.map((it) => (
                  <div key={it.articleId} className="flex items-baseline gap-1.5 text-sm text-black/80">
                    <span className="font-medium">{it.articleName}</span>
                    {it.articleSerial ? (
                      <span className="text-xs text-black/50">({it.articleSerial})</span>
                    ) : null}
                    <span className="ml-auto shrink-0 text-xs font-semibold text-black/60">
                      x{it.quantity}
                    </span>
                  </div>
                ))}
              </div>
            </td>
            <td className="px-5 py-4 align-top text-sm text-black/70">
              {formatDateISO(r.startDate)}
              {r.startTime ? <div className="mt-1 text-xs text-black/50">{r.startTime}</div> : null}
            </td>
            <td className="px-5 py-4 align-top text-sm text-black/70">
              {formatDateISO(r.dueDate)}
              {r.endTime ? <div className="mt-1 text-xs text-black/50">{r.endTime}</div> : null}
            </td>
            <td className="px-5 py-4 align-top">
              <Badge variant={requestStatusToBadgeVariant(r.status)}>
                {requestStatusLabel(r.status)}
              </Badge>
            </td>
            <td className="px-5 py-4 align-top text-sm text-black/70">
              {r.adminNote ?? "Sin nota"}
            </td>
            <td className="px-5 py-4 align-top">
              <RequestAdminActions
                mode="requests"
                request={r}
                onApprove={async () => {
                  const path =
                    r.type === "room"
                      ? `/api/room-reservations/${r.id}/approve`
                      : `/api/loans/${r.id}/approve`;
                  await apiFetch(path, { method: "PATCH" });
                  await reload();
                }}
                onReject={async (note) => {
                  const path =
                    r.type === "room"
                      ? `/api/room-reservations/${r.id}/reject`
                      : `/api/loans/${r.id}/reject`;
                  await apiFetch(path, {
                    method: "PATCH",
                    body: JSON.stringify(r.type === "room" ? { motivo: note } : { note }),
                  });
                  await reload();
                }}
                onDeliver={async () => {
                  await apiFetch(`/api/loans/${r.id}/deliver`, { method: "PATCH" });
                  await reload();
                }}
                onCancel={() => {
                  setCancelId(r.id);
                }}
                onMarkReturned={() => {}}
              />
            </td>
          </tr>
        ))}
      </Table>

      {items.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-black/[0.01] p-12 text-center">
          <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-black/[0.04] text-black/40">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </span>
          <div className="text-sm font-semibold text-black/70">No se encontraron solicitudes</div>
          <div className="mt-1 text-xs text-black/50">Ajusta los filtros o cambia los términos de búsqueda.</div>
        </div>
      ) : null}

      <RequestDetailsModal
        request={detailRequest}
        onClose={() => setDetailRequest(null)}
      />

      <ConfirmModal
        open={!!cancelId}
        title={state.requests.find((r) => r.id === cancelId)?.type === "room" ? "Cancelar reserva" : "Cancelar préstamo"}
        description={
          state.requests.find((r) => r.id === cancelId)?.type === "room"
            ? "¿Estás seguro de que deseas cancelar esta reserva de salón?"
            : "¿Estás seguro de que deseas cancelar este préstamo? Los artículos reservados volverán al inventario."
        }
        confirmText="Confirmar cancelación"
        cancelText="Volver"
        onClose={() => setCancelId(null)}
        onConfirm={() => {
          if (!cancelId) return;
          void (async () => {
            const target = state.requests.find((r) => r.id === cancelId);
            const path =
              target?.type === "room"
                ? `/api/room-reservations/${cancelId}/cancel`
                : `/api/loans/${cancelId}/cancel`;
            await apiFetch(path, { method: "PATCH" });
            setCancelId(null);
            await reload();
          })();
        }}
      />
    </div>
  );
}
