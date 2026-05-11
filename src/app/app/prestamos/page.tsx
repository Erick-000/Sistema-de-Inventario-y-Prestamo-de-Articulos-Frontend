"use client";

import { Badge } from "@/components/Badge";
import { FilterPills } from "@/components/FilterPills";
import { PageHeader } from "@/components/PageHeader";
import { ConfirmModal } from "@/components/ConfirmModal";
import { RequestAdminActions } from "@/components/RequestAdminActions";
import { RequestDetailsModal } from "@/components/RequestDetailsModal";
import { SearchInput } from "@/components/SearchInput";
import { Table } from "@/components/Table";
import { IconLoans } from "@/components/Icons";
import type { LoanRequest, LoanRequestStatus } from "@/lib/types/requests";
import { useAppState } from "@/state/app-state";
import { apiFetch } from "@/lib/api/client";
import { formatDateISO } from "@/lib/ui/format";
import {
  requestStatusLabel,
  requestStatusToBadgeVariant,
} from "@/lib/ui/status";
import { useMemo, useState } from "react";

import { Suspense } from "react";

function PrestamosContent() {
  const { state, reload } = useAppState();
  const [status, setStatus] = useState<string>("TODOS");
  const [query, setQuery] = useState<string>("");

  const isAdmin = state.role === "admin";
  const isTeacher = state.role === "teacher";

  const loanStatusOptions = useMemo<{ value: LoanRequestStatus | "TODOS"; label: string }[]>(() => {
    if (isTeacher) {
      return [
        { value: "TODOS", label: "Todos" },
        { value: "SOLICITADO", label: "Solicitado" },
        { value: "RESERVADO", label: "Reservado" },
        { value: "ACTIVO", label: "Activos" },
        { value: "VENCIDO", label: "Vencidos" },
        { value: "DEVUELTO", label: "Devueltos" },
        { value: "RECHAZADA", label: "Rechazado" },
        { value: "CANCELADO", label: "Cancelado" },
      ];
    }
    return [
      { value: "TODOS", label: "Todos" },
      { value: "ACTIVO", label: "Activos" },
      { value: "VENCIDO", label: "Vencidos" },
      { value: "DEVUELTO", label: "Devueltos" },
    ];
  }, [isTeacher]);

  const loanStatuses = useMemo(() => {
    if (isTeacher) {
      return new Set<LoanRequestStatus>([
        "SOLICITADO", "RESERVADO", "ACTIVO", "VENCIDO", 
        "DEVUELTO", "RECHAZADA", "CANCELADO"
      ]);
    }
    return new Set<LoanRequestStatus>(["ACTIVO", "VENCIDO", "DEVUELTO"]);
  }, [isTeacher]);

  const [cancelId, setCancelId] = useState<string | null>(null);
  const [detailRequest, setDetailRequest] = useState<LoanRequest | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();

    return [...state.requests]
      .filter((r) => r.type === "article")
      .filter((r) => loanStatuses.has(r.status))
      .filter((r) => (status === "TODOS" ? true : r.status === status))
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
      .sort((a, b) => b.dueDate.localeCompare(a.dueDate));
  }, [state.requests, status, query, loanStatuses]);

  function printLoanAct(request: LoanRequest) {
    const code = `UIB-${request.id.slice(-6).toUpperCase()}`;
    const itemsRows = request.items
      .map(
        (item) => `
          <tr>
            <td>${item.articleName}</td>
            <td>${item.articleSerial ?? "Sin serial"}</td>
            <td>${item.quantity}</td>
          </tr>
        `,
      )
      .join("");
    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Acta de préstamo ${code}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #111; margin: 32px; }
            header { border-bottom: 2px solid #111; padding-bottom: 16px; margin-bottom: 24px; }
            h1 { font-size: 20px; margin: 0; }
            .muted { color: #555; font-size: 12px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0; }
            .box { border: 1px solid #ddd; border-radius: 8px; padding: 12px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #ddd; padding: 10px; font-size: 13px; text-align: left; }
            th { background: #f4f4f4; }
            .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-top: 72px; }
            .line { border-top: 1px solid #111; padding-top: 8px; text-align: center; font-size: 12px; }
            @media print { button { display: none; } body { margin: 20mm; } }
          </style>
        </head>
        <body>
          <button onclick="window.print()">Imprimir / Guardar PDF</button>
          <header>
            <h1>Acta de préstamo de artículos</h1>
            <div class="muted">Código: ${code} · Generada: ${new Date().toLocaleString("es-CO")}</div>
          </header>
          <section class="grid">
            <div class="box"><strong>Docente</strong><br/>${request.teacherName}</div>
            <div class="box"><strong>Programa</strong><br/>${request.program || "No registrado"}</div>
            <div class="box"><strong>Fecha de inicio</strong><br/>${formatDateISO(request.startDate)}</div>
            <div class="box"><strong>Hora de entrega</strong><br/>${request.startTime ?? "No registrada"}</div>
            <div class="box"><strong>Fecha límite</strong><br/>${formatDateISO(request.dueDate)}</div>
            <div class="box"><strong>Hora de devolución</strong><br/>${request.endTime ?? "No registrada"}</div>
            <div class="box"><strong>Estado</strong><br/>${requestStatusLabel(request.status)}</div>
            <div class="box"><strong>ID interno</strong><br/>${request.id}</div>
          </section>
          <table>
            <thead>
              <tr><th>Artículo</th><th>Serial</th><th>Cantidad</th></tr>
            </thead>
            <tbody>${itemsRows}</tbody>
          </table>
          <p class="muted">
            El docente declara recibir los artículos relacionados y se compromete a devolverlos en buen estado en la fecha indicada.
          </p>
          <section class="signatures">
            <div class="line">Firma docente</div>
            <div class="line">Firma responsable</div>
          </section>
        </body>
      </html>
    `;
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;
    win.document.write(html);
    win.document.close();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isAdmin ? "Préstamos" : "Mis préstamos"}
        description={
          isAdmin
            ? "Préstamos activos, vencidos y devueltos."
            : "Solicita artículos y consulta el estado de tus solicitudes."
        }
        right={
          <div className="w-full md:max-w-sm">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder={isAdmin ? "Buscar por docente, artículo o ID" : "Buscar artículo o ID"}
            />
          </div>
        }
      />



      <div className="flex flex-col gap-3">
        <div className="text-xs font-semibold tracking-widest text-black/60">VISTA</div>
        <FilterPills options={loanStatusOptions} value={status} onChange={setStatus} />
      </div>

      <Table headers={["Docente", "Artículos", "Inicio", "Límite", "Estado", "Acciones"]}>
        {rows.map((r) => (
          <tr key={r.id} className="hover:bg-black/[0.02]">
            <td className="px-5 py-4 align-top">
              <div className="text-sm font-semibold text-black">{r.teacherName}</div>
              <div className="mt-0.5 text-xs font-semibold tracking-widest text-black/50">
                {r.program}
              </div>
              <div className="mt-1 font-mono text-[10px] text-black/40">UIB-{r.id.slice(-6).toUpperCase()}</div>
              <button
                type="button"
                className="mt-2 text-[10px] font-semibold text-black underline-offset-2 hover:underline"
                onClick={() => setDetailRequest(r)}
              >
                Ver detalles
              </button>
            </td>
            <td className="px-5 py-4 align-top">
              <div className="space-y-1">
                {r.items.map((it) => (
                  <div key={it.articleId} className="text-sm text-black/80">
                    {it.articleName}
                    {it.articleSerial ? (
                      <span className="text-black/50"> ({it.articleSerial})</span>
                    ) : null}
                    <span className="text-black/50"> × {it.quantity}</span>
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
            <td className="px-5 py-4 align-top">
              {/* Admin actions */}
              <div className="mb-2 flex justify-end">
                <button
                  type="button"
                  className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold text-black/70 hover:bg-black/[0.03]"
                  onClick={() => printLoanAct(r)}
                >
                  Acta
                </button>
              </div>
              <RequestAdminActions
                mode="loans"
                request={r}
                onApprove={() => {}}
                onReject={() => {}}
                onCancel={() => { setCancelId(r.id); }}
                onMarkReturned={async (payload) => {
                  await apiFetch(`/api/loans/${r.id}/return`, {
                    method: "PATCH",
                    body: JSON.stringify(payload),
                  });
                  await reload();
                }}
              />

            </td>
          </tr>
        ))}
      </Table>

      {rows.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-black/[0.01] p-12 text-center">
          <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-black/[0.04] text-black/40">
            <IconLoans className="h-6 w-6" />
          </span>
          <div className="text-sm font-semibold text-black/70">No hay préstamos</div>
          <div className="mt-1 text-xs text-black/50">Los préstamos activos aparecerán aquí.</div>
        </div>
      ) : null}

      <RequestDetailsModal
        request={detailRequest}
        onClose={() => setDetailRequest(null)}
      />



      <ConfirmModal
        open={!!cancelId}
        title="Cancelar préstamo"
        description="¿Estás seguro de que deseas cancelar este préstamo? Los artículos reservados volverán al inventario."
        confirmText="Confirmar cancelación"
        cancelText="Volver"
        onClose={() => setCancelId(null)}
        onConfirm={() => {
          if (!cancelId) return;
          void (async () => {
            await apiFetch(`/api/loans/${cancelId}/cancel`, { method: "PATCH" });
            setCancelId(null);
            await reload();
          })();
        }}
      />
    </div>
  );
}

export default function PrestamosPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-black/50">Cargando...</div>}>
      <PrestamosContent />
    </Suspense>
  );
}
