"use client";

import { useMemo, useState } from "react";
import { getUser } from "@/lib/auth/session";
import type { LoanRequest } from "@/lib/types/requests";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { IconCheck, IconReturn, IconX } from "@/components/Icons";

export type RequestAdminActionsMode = "requests" | "loans";

export function RequestAdminActions({
  mode,
  request,
  onApprove,
  onReject,
  onDeliver,
  onCancel,
  onMarkReturned,
}: {
  mode: RequestAdminActionsMode;
  request: LoanRequest;
  onApprove: () => void;
  onReject: (note: string) => void;
  onDeliver?: () => void;
  onCancel?: () => void;
  onMarkReturned: (payload: { condition: "OK" | "ISSUE"; note?: string }) => void;
}) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [note, setNote] = useState("");
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnCondition, setReturnCondition] = useState<"OK" | "ISSUE">("OK");
  const [returnNote, setReturnNote] = useState("");

  const canApproveReject = request.status === "SOLICITADO";
  const canDeliver = request.type === "article" && request.status === "RESERVADO";
  // Admin confirms receipt directly when item is active or overdue
  const canReturn = request.status === "ACTIVO" || request.status === "VENCIDO";
  const canCancel =
    request.status !== "CANCELADO" &&
    request.status !== "RECHAZADA" &&
    request.status !== "DEVUELTO" &&
    request.status !== "SOLICITADO" &&
    request.status !== "EN_DEVOLUCION";

  const showApproveReject = mode === "requests" && canApproveReject;
  const showDeliver = mode === "requests" && canDeliver;
  const showReturn = mode === "loans" && canReturn;
  const showCancel = canCancel;

  const rejectDisabled = useMemo(() => note.trim().length < 5, [note]);
  const returnDisabled = returnCondition === "ISSUE" && returnNote.trim().length < 5;

  const isAdmin = getUser()?.role === "admin";
  if (!isAdmin) return null;

  return (
    <>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {showApproveReject ? (
          <>
            <Button
              variant="secondary"
              onClick={onApprove}
              leftIcon={<IconCheck className="h-5 w-5" />}
            >
              {request.type === "room" ? "Aprobar reserva" : "Aprobar préstamo"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setRejectOpen(true)}
              leftIcon={<IconX className="h-5 w-5" />}
            >
              {request.type === "room" ? "Rechazar reserva" : "Rechazar préstamo"}
            </Button>
          </>
        ) : null}

        {showDeliver && onDeliver ? (
          <Button
            variant="secondary"
            onClick={onDeliver}
            leftIcon={<IconCheck className="h-5 w-5" />}
          >
            Entregar artículos
          </Button>
        ) : null}

        {showReturn ? (
          <Button
            variant="secondary"
            onClick={() => setReturnOpen(true)}
            leftIcon={<IconReturn className="h-5 w-5" />}
          >
            Confirmar recepción
          </Button>
        ) : null}

        {showCancel && onCancel ? (
          <Button
            variant="ghost"
            onClick={onCancel}
            leftIcon={<IconX className="h-5 w-5" />}
          >
            Cancelar
          </Button>
        ) : null}
      </div>

      <Modal
        open={rejectOpen}
        title={request.type === "room" ? "Rechazar reserva" : "Rechazar préstamo"}
        onClose={() => {
          setRejectOpen(false);
          setNote("");
        }}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setRejectOpen(false);
                setNote("");
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="secondary"
              disabled={rejectDisabled}
              onClick={() => {
                onReject(note.trim());
                setRejectOpen(false);
                setNote("");
              }}
            >
              Confirmar rechazo
            </Button>
          </>
        }
      >
        <label className="mb-2 block text-xs font-semibold tracking-widest text-black/60">
          MOTIVO
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          className="w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none focus:border-uniclaretiana-yellow"
          placeholder="Escribe el motivo del rechazo (mínimo 5 caracteres)"
        />
      </Modal>

      <Modal
        open={returnOpen}
        title="Confirmar recepción de artículos"
        onClose={() => {
          setReturnOpen(false);
          setReturnCondition("OK");
          setReturnNote("");
        }}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setReturnOpen(false);
                setReturnCondition("OK");
                setReturnNote("");
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="secondary"
              disabled={returnDisabled}
              onClick={() => {
                onMarkReturned({
                  condition: returnCondition,
                  note: returnCondition === "ISSUE" ? returnNote.trim() : undefined,
                });
                setReturnOpen(false);
                setReturnCondition("OK");
                setReturnNote("");
              }}
            >
              Cerrar préstamo
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-sm">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                returnCondition === "OK"
                  ? "border-uniclaretiana-yellow bg-uniclaretiana-yellow/20 text-black"
                  : "border-black/10 bg-white text-black/60 hover:bg-black/[0.03]"
              }`}
              onClick={() => setReturnCondition("OK")}
            >
              Todo correcto
            </button>
            <button
              type="button"
              className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                returnCondition === "ISSUE"
                  ? "border-red-300 bg-red-50 text-red-700"
                  : "border-black/10 bg-white text-black/60 hover:bg-black/[0.03]"
              }`}
              onClick={() => setReturnCondition("ISSUE")}
            >
              Con novedad
            </button>
          </div>

          {returnCondition === "ISSUE" ? (
            <label className="block space-y-2">
              <span className="text-xs font-semibold tracking-widest text-black/60">
                NOVEDAD
              </span>
              <textarea
                value={returnNote}
                onChange={(e) => setReturnNote(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none focus:border-uniclaretiana-yellow"
                placeholder="Ej: el control llegó sin tapa, cable incompleto, equipo con golpe..."
              />
            </label>
          ) : (
            <div className="rounded-xl border border-black/10 bg-black/[0.02] px-4 py-3 text-xs font-semibold text-black/55">
              El stock se restaurará y el préstamo quedará cerrado.
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
