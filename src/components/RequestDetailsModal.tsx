"use client";

import { Modal } from "@/components/Modal";
import { Badge } from "@/components/Badge";
import type { LoanRequest } from "@/lib/types/requests";
import { formatDateISO } from "@/lib/ui/format";
import { requestStatusLabel, requestStatusToBadgeVariant } from "@/lib/ui/status";

export function RequestDetailsModal({
  request,
  onClose,
}: {
  request: LoanRequest | null;
  onClose: () => void;
}) {
  return (
    <Modal open={!!request} title="Detalles de la solicitud" onClose={onClose}>
      {request && (
        <div className="space-y-5">
          {/* Docente + Estado */}
          <div className="flex items-start justify-between gap-4 rounded-2xl border border-black/10 bg-black/[0.015] p-4">
            <div>
              <div className="text-sm font-bold text-black">{request.teacherName}</div>
              <div className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-black/50">
                {request.program}
              </div>
              <div className="mt-1 font-mono text-[10px] text-black/40">
                UIB-{request.id.slice(-6).toUpperCase()}
              </div>
            </div>
            <Badge variant={requestStatusToBadgeVariant(request.status)}>
              {requestStatusLabel(request.status)}
            </Badge>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-black/10 p-3">
              <div className="text-[9px] font-bold uppercase tracking-widest text-black/40">
                {request.type === "room" ? "Fecha" : "Fecha de inicio"}
              </div>
              <div className="mt-1 text-sm font-semibold text-black">
                {formatDateISO(request.startDate)}
                {request.startTime ? <span className="text-black/50"> · {request.startTime}</span> : null}
              </div>
            </div>
            <div className="rounded-xl border border-black/10 p-3">
              <div className="text-[9px] font-bold uppercase tracking-widest text-black/40">
                {request.type === "room" ? "Hora fin" : "Devolución"}
              </div>
              <div className="mt-1 text-sm font-semibold text-black">
                {request.type === "room" ? request.endTime : formatDateISO(request.dueDate)}
                {request.type === "article" && request.endTime ? <span className="text-black/50"> · {request.endTime}</span> : null}
              </div>
            </div>
          </div>

          {/* Artículos / Salón */}
          <div>
            <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-black/50">
              {request.type === "room" ? "Salón solicitado" : "Artículos solicitados"}
            </div>
            <div className="space-y-2">
              {request.items.map((it) => (
                <div
                  key={it.articleId}
                  className="flex items-center justify-between rounded-xl border border-black/10 bg-white px-4 py-3 shadow-sm"
                >
                  <div>
                    <div className="text-sm font-semibold text-black">{it.articleName}</div>
                    {it.articleSerial && (
                      <div className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-black/50">
                        {request.type === "room" ? "Horario" : "Serial"}: {it.articleSerial}
                      </div>
                    )}
                  </div>
                  {request.type === "article" ? (
                    <span className="inline-flex h-8 min-w-[2.5rem] items-center justify-center rounded-lg bg-uniclaretiana-yellow px-3 text-xs font-bold text-uniclaretiana-black">
                      x{it.quantity}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          {/* Nota admin (solo si existe) */}
          {request.adminNote && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <div className="text-[9px] font-bold uppercase tracking-widest text-red-500">
                Nota administrativa
              </div>
              <div className="mt-1 text-sm font-medium text-red-800">
                {request.adminNote}
              </div>
            </div>
          )}

          {request.returnCondition ? (
            <div className="rounded-xl border border-black/10 bg-black/[0.015] px-4 py-3">
              <div className="text-[9px] font-bold uppercase tracking-widest text-black/40">
                Devolución
              </div>
              <div className="mt-1 text-sm font-semibold text-black">
                {request.returnCondition === "ISSUE" ? "Con novedad" : "Todo correcto"}
              </div>
              {request.returnNote ? (
                <div className="mt-1 text-sm text-black/70">{request.returnNote}</div>
              ) : null}
            </div>
          ) : null}

          {/* Creada el */}
          <div className="text-right text-[10px] text-black/40">
            Creada el {formatDateISO(request.createdAt.slice(0, 10))}
          </div>
        </div>
      )}
    </Modal>
  );
}
