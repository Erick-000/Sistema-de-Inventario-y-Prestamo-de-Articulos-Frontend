"use client";

import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { FilterPills } from "@/components/FilterPills";
import { PageHeader } from "@/components/PageHeader";
import { ConfirmModal } from "@/components/ConfirmModal";
import { RequestAdminActions } from "@/components/RequestAdminActions";
import { RequestDetailsModal } from "@/components/RequestDetailsModal";
import { SearchInput } from "@/components/SearchInput";
import { Table } from "@/components/Table";
import { IconLoans } from "@/components/Icons";
import { Modal } from "@/components/Modal";
import type { LoanRequest, LoanRequestStatus } from "@/lib/types/requests";
import { useAppState } from "@/state/app-state";
import { apiFetch } from "@/lib/api/client";
import { getUser } from "@/lib/auth/session";
import { formatDateISO } from "@/lib/ui/format";
import {
  requestStatusLabel,
  requestStatusToBadgeVariant,
} from "@/lib/ui/status";
import { type PointerEvent, useEffect, useMemo, useRef, useState } from "react";

import { Suspense } from "react";

function SignaturePad({ onChange }: { onChange: (value: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;
    canvas.width = Math.floor(rect.width * scale);
    canvas.height = Math.floor(rect.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(scale, scale);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = "#111";
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, rect.width, rect.height);
  }, []);

  function point(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function emit() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onChange(canvas.toDataURL("image/png"));
  }

  function clear() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, rect.width, rect.height);
    onChange("");
  }

  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        className="h-44 w-full touch-none rounded-xl border border-black/10 bg-white shadow-inner"
        onPointerDown={(event) => {
          drawing.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          const ctx = event.currentTarget.getContext("2d");
          const pos = point(event);
          ctx?.beginPath();
          ctx?.moveTo(pos.x, pos.y);
        }}
        onPointerMove={(event) => {
          if (!drawing.current) return;
          const ctx = event.currentTarget.getContext("2d");
          const pos = point(event);
          ctx?.lineTo(pos.x, pos.y);
          ctx?.stroke();
        }}
        onPointerUp={() => {
          drawing.current = false;
          emit();
        }}
        onPointerCancel={() => {
          drawing.current = false;
          emit();
        }}
      />
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={clear}>
          Limpiar firma
        </Button>
      </div>
    </div>
  );
}

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
  const [actRequest, setActRequest] = useState<LoanRequest | null>(null);
  const [signatureDataUrl, setSignatureDataUrl] = useState("");
  const [signatureSaving, setSignatureSaving] = useState(false);
  const [signatureError, setSignatureError] = useState("");

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

  async function saveActSignature() {
    if (!actRequest || !signatureDataUrl) return;
    setSignatureSaving(true);
    setSignatureError("");
    try {
      await apiFetch(`/api/loans/${actRequest.id}/sign-act`, {
        method: "PATCH",
        body: JSON.stringify({
          signatureDataUrl,
          signerName: getUser()?.name ?? actRequest.teacherName,
        }),
      });
      setSignatureDataUrl("");
      setActRequest(null);
      await reload();
    } catch (err) {
      setSignatureError(err instanceof Error ? err.message : "No se pudo guardar la firma");
    } finally {
      setSignatureSaving(false);
    }
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
                  onClick={() => {
                    setActRequest(r);
                    setSignatureDataUrl("");
                    setSignatureError("");
                  }}
                >
                  {r.actSignature ? "Ver acta firmada" : "Firmar acta"}
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

      <Modal
        open={!!actRequest}
        title={actRequest?.actSignature ? "Acta firmada" : "Firmar acta"}
        size="xl"
        onClose={() => {
          setActRequest(null);
          setSignatureDataUrl("");
          setSignatureError("");
        }}
        footer={
          <>
            {!actRequest?.actSignature ? (
              <Button
                variant="secondary"
                disabled={!signatureDataUrl || signatureSaving}
                onClick={() => {
                  void saveActSignature();
                }}
              >
                {signatureSaving ? "Guardando..." : "Guardar firma"}
              </Button>
            ) : null}
          </>
        }
      >
        {actRequest ? (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-3 rounded-xl border border-black/10 bg-black/[0.015] p-4 text-sm md:grid-cols-2">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-black/40">Docente</div>
                <div className="mt-1 font-semibold text-black">{actRequest.teacherName}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-black/40">Código</div>
                <div className="mt-1 font-mono text-xs text-black/70">UIB-{actRequest.id.slice(-6).toUpperCase()}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-black/40">Entrega</div>
                <div className="mt-1 font-semibold text-black">{formatDateISO(actRequest.startDate)} · {actRequest.startTime ?? ""}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-black/40">Devolución</div>
                <div className="mt-1 font-semibold text-black">{formatDateISO(actRequest.dueDate)} · {actRequest.endTime ?? ""}</div>
              </div>
            </div>

            <div className="space-y-2">
              {actRequest.items.map((item) => (
                <div key={item.articleId} className="flex items-center justify-between rounded-xl border border-black/10 px-4 py-3 text-sm">
                  <div>
                    <div className="font-semibold text-black">{item.articleName}</div>
                    <div className="text-xs text-black/50">{item.articleSerial ?? "Sin serial"}</div>
                  </div>
                  <span className="text-xs font-bold text-black/60">x{item.quantity}</span>
                </div>
              ))}
            </div>

            {actRequest.actSignature ? (
              <div className="rounded-xl border border-black/10 bg-white p-4">
                <div className="text-[10px] font-bold uppercase tracking-widest text-black/40">Firma guardada</div>
                <img
                  src={actRequest.actSignature.dataUrl}
                  alt="Firma guardada"
                  className="mt-3 h-28 max-w-full object-contain"
                />
                <div className="mt-2 text-xs font-semibold text-black/50">
                  {actRequest.actSignature.signerName} · {new Date(actRequest.actSignature.signedAt).toLocaleString("es-CO")}
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-2 text-xs font-semibold tracking-widest text-black/60">FIRMA EN PANTALLA</div>
                <div className="mb-3 rounded-xl border border-black/10 bg-black/[0.02] px-4 py-3 text-xs font-semibold text-black/55">
                  Firma usando el mouse, el dedo en pantalla táctil o un lápiz digital compatible.
                </div>
                <SignaturePad onChange={setSignatureDataUrl} />
                {signatureError ? (
                  <div className="mt-2 rounded-xl border border-red-500/30 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                    {signatureError}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        ) : null}
      </Modal>

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
