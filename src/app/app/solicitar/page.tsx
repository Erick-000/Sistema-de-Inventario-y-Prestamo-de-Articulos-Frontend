"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useAppState } from "@/state/app-state";
import { apiFetch, ApiError } from "@/lib/api/client";
import { formatDateISO } from "@/lib/ui/format";
import { requestStatusLabel, requestStatusToBadgeVariant } from "@/lib/ui/status";
import { Badge } from "@/components/Badge";

// ─── Types ────────────────────────────────────────────────────────────────────
type RoomDto = {
  _id: string;
  nombre: string;
  ubicacion?: string;
  capacidad: number;
  descripcion?: string;
  elementos?: string;
  disponibleDesde: string;
  disponibleHasta: string;
  activo: boolean;
};

type ReservationDto = {
  _id: string;
  nombreSalon: string;
  fecha: string;
  startMin: number;
  endMin: number;
  estado: "SOLICITADO" | "RESERVADO" | "RECHAZADA" | "CANCELADA";
};

function minutesToTime(min: number) {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}

const INPUT =
  "h-11 w-full rounded-xl border border-black/10 bg-white px-4 text-sm text-black outline-none focus:border-uniclaretiana-yellow";

const MAX_ARTICLE_LOAN_DAYS = 0;
const MAX_ARTICLE_LOAN_HOURS = 4;
const ARTICLE_LOAN_LIMIT_TEXT = "Los artículos deben devolverse el mismo día.";

function addDaysISO(dateISO: string, days: number) {
  const date = new Date(`${dateISO}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function timeToMinutes(value: string) {
  const [hh, mm] = value.split(":").map(Number);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
  return hh * 60 + mm;
}

function addHoursToTime(value: string, hours: number) {
  const minutes = timeToMinutes(value) ?? 8 * 60;
  const next = Math.min(23 * 60 + 59, minutes + hours * 60);
  return minutesToTime(next);
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function SolicitarContent() {
  const { state, reload } = useAppState();
  const [tab, setTab] = useState<"articulo" | "salon">("articulo");

  // ── Article form state ──
  const today = new Date().toISOString().slice(0, 10);
  const [startDate, setStartDate] = useState(today);
  const [dueDate, setDueDate] = useState(today);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");
  const [items, setItems] = useState([{ articleId: "", quantity: "1" }]);
  const [articleError, setArticleError] = useState<string | null>(null);
  const [articleSuccess, setArticleSuccess] = useState(false);

  // ── Room form state ──
  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [reservations, setReservations] = useState<ReservationDto[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [roomForm, setRoomForm] = useState({
    salonId: "",
    fecha: today,
    horaInicio: "07:00",
    horaFin: "08:00",
    nota: "",
  });
  const [roomError, setRoomError] = useState<string | null>(null);
  const [roomSuccess, setRoomSuccess] = useState(false);

  // load rooms + my reservations
  useEffect(() => {
    Promise.all([
      apiFetch<RoomDto[]>("/api/rooms"),
      apiFetch<ReservationDto[]>("/api/room-reservations/mine").catch(() => []),
    ])
      .then(([r, res]) => {
        setRooms(r.filter((x) => x.activo));
        setReservations(res as ReservationDto[]);
      })
      .finally(() => setLoadingRooms(false));
  }, []);

  const availableArticles = useMemo(
    () => state.inventory.filter((it) => it.active && it.available > 0),
    [state.inventory],
  );

  // ── Article submit ──
  async function submitArticle(e: React.FormEvent) {
    e.preventDefault();
    setArticleError(null);
    setArticleSuccess(false);
    if (startDate > dueDate) {
      setArticleError("La fecha límite debe ser igual o posterior a la fecha de inicio.");
      return;
    }
    if (dueDate > addDaysISO(startDate, MAX_ARTICLE_LOAN_DAYS)) {
      setArticleError(ARTICLE_LOAN_LIMIT_TEXT);
      return;
    }
    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);
    if (startMin === null || endMin === null || endMin <= startMin) {
      setArticleError("La hora de devolución debe ser posterior a la hora de inicio.");
      return;
    }
    if (endMin - startMin > MAX_ARTICLE_LOAN_HOURS * 60) {
      setArticleError(`El préstamo no puede superar ${MAX_ARTICLE_LOAN_HOURS} horas.`);
      return;
    }
    const payload = {
      fechaInicio: startDate,
      fechaLimite: dueDate,
      horaInicio: startTime,
      horaFin: endTime,
      items: items
        .map((it) => ({ articuloId: it.articleId, cantidad: Math.floor(Number(it.quantity)) }))
        .filter((it) => it.articuloId && it.cantidad > 0),
    };
    if (payload.items.length === 0) {
      setArticleError("Selecciona al menos un artículo.");
      return;
    }
    try {
      await apiFetch("/api/loans", { method: "POST", body: JSON.stringify(payload) });
      setItems([{ articleId: "", quantity: "1" }]);
      setStartDate(today);
      setDueDate(today);
      setStartTime("08:00");
      setEndTime("09:00");
      setArticleSuccess(true);
      await reload();
    } catch (err) {
      setArticleError(err instanceof Error ? err.message : "No se pudo enviar la solicitud.");
    }
  }

  // ── Room submit ──
  async function submitRoom(e: React.FormEvent) {
    e.preventDefault();
    setRoomError(null);
    setRoomSuccess(false);
    if (roomForm.horaInicio >= roomForm.horaFin) {
      setRoomError("La hora de inicio debe ser anterior a la hora de fin.");
      return;
    }
    try {
      await apiFetch("/api/room-reservations", {
        method: "POST",
        body: JSON.stringify({
          salonId: roomForm.salonId,
          fecha: roomForm.fecha,
          horaInicio: roomForm.horaInicio,
          horaFin: roomForm.horaFin,
          nota: roomForm.nota || undefined,
        }),
      });
      const updated = await apiFetch<ReservationDto[]>("/api/room-reservations/mine").catch(() => []);
      setReservations(updated as ReservationDto[]);
      setRoomForm({ salonId: "", fecha: today, horaInicio: "07:00", horaFin: "08:00", nota: "" });
      setRoomSuccess(true);
    } catch (err) {
      setRoomError(err instanceof ApiError ? err.message : "No se pudo crear la reserva.");
    }
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-black">Solicitar</h1>
        <p className="text-sm text-black/60">Solicita un préstamo de artículo o reserva un salón.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl border border-black/10 bg-black/[0.02] p-1">
        {(["articulo", "salon"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${
              tab === t
                ? "bg-white text-black shadow-sm"
                : "text-black/50 hover:text-black/70"
            }`}
          >
            {t === "articulo" ? "📦 Préstamo de artículo" : "🏫 Reserva de salón"}
          </button>
        ))}
      </div>

      {/* ── ARTICLE TAB ─────────────────────────────────────────── */}
      {tab === "articulo" && (
        <div className="space-y-5">
          <div className="rounded-2xl border-2 border-uniclaretiana-yellow/50 bg-white p-6 shadow-sm">
            <div className="mb-5 text-base font-bold text-black">Nueva solicitud de préstamo de artículo</div>

            <form onSubmit={submitArticle} className="space-y-4" autoComplete="off">
              {/* Dates */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold tracking-widest text-black/60">FECHA DE INICIO</label>
                  <input type="date" className={INPUT} value={startDate} min={today}
                    onChange={(e) => {
                      const nextStart = e.target.value;
                      setStartDate(nextStart);
                      const maxDue = addDaysISO(nextStart, MAX_ARTICLE_LOAN_DAYS);
                      if (dueDate < nextStart || dueDate > maxDue) setDueDate(nextStart);
                    }} required />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold tracking-widest text-black/60">FECHA LÍMITE</label>
                  <input type="date" className={INPUT} value={dueDate} min={startDate} max={addDaysISO(startDate, MAX_ARTICLE_LOAN_DAYS)}
                    onChange={(e) => setDueDate(e.target.value)} required />
                </div>
              </div>
              <p className="text-xs font-semibold text-black/50">
                Los artículos son para uso institucional. {ARTICLE_LOAN_LIMIT_TEXT} Máximo {MAX_ARTICLE_LOAN_HOURS} horas.
              </p>

              {/* Time range */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold tracking-widest text-black/60">HORA DE ENTREGA</label>
                  <input type="time" className={INPUT} value={startTime}
                    onChange={(e) => {
                      const nextStart = e.target.value;
                      setStartTime(nextStart);
                      const nextEnd = addHoursToTime(nextStart, 1);
                      if ((timeToMinutes(endTime) ?? 0) <= (timeToMinutes(nextStart) ?? 0)) setEndTime(nextEnd);
                    }} required />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold tracking-widest text-black/60">HORA DE DEVOLUCIÓN</label>
                  <input type="time" className={INPUT} value={endTime} min={startTime} max={addHoursToTime(startTime, MAX_ARTICLE_LOAN_HOURS)}
                    onChange={(e) => setEndTime(e.target.value)} required />
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                <label className="text-xs font-semibold tracking-widest text-black/60">ARTÍCULOS</label>
                {items.map((it, idx) => {
                  const maxQty = availableArticles.find((a) => a.id === it.articleId)?.available || 1;
                  return (
                    <div key={idx} className="grid grid-cols-12 gap-3">
                      <div className="col-span-8">
                        <select className={INPUT} value={it.articleId}
                          onChange={(e) => { const n = [...items]; n[idx] = { ...n[idx], articleId: e.target.value }; setItems(n); }}
                          required>
                          <option value="">Selecciona un artículo...</option>
                          {availableArticles.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.name}{a.serial ? ` · ${a.serial}` : ""} (disponibles: {a.available})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-3">
                        <input type="number" className={INPUT} min={1} max={maxQty} value={it.quantity}
                          autoComplete="off"
                          onChange={(e) => { const n = [...items]; n[idx] = { ...n[idx], quantity: e.target.value }; setItems(n); }}
                          placeholder="Cant." required />
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        <button type="button" className="h-11 w-full rounded-xl border border-black/10 text-sm font-bold text-black/50 hover:bg-black/5"
                          onClick={() => { const n = items.filter((_, i) => i !== idx); setItems(n.length ? n : [{ articleId: "", quantity: "1" }]); }}>
                          ×
                        </button>
                      </div>
                    </div>
                  );
                })}
                <button type="button"
                  className="h-10 w-full rounded-xl border border-dashed border-black/20 text-sm font-semibold text-black/50 hover:border-black/40 hover:text-black/70"
                  onClick={() => setItems([...items, { articleId: "", quantity: "1" }])}>
                  + Agregar otro artículo
                </button>
              </div>

              {/* Feedback */}
              {articleError && <p className="text-sm font-semibold text-red-600">{articleError}</p>}
              {articleSuccess && <p className="text-sm font-semibold text-green-600">✓ Solicitud enviada correctamente.</p>}

              {/* Submit */}
              <button type="submit"
                className="h-11 w-full rounded-xl bg-uniclaretiana-yellow text-sm font-bold text-uniclaretiana-black transition-colors hover:opacity-90">
                Enviar solicitud de préstamo
              </button>
            </form>
          </div>

          {/* My requests history */}
          {state.requests.length > 0 && (
            <div>
              <h2 className="mb-3 text-xs font-bold tracking-widest text-black/50">MIS SOLICITUDES RECIENTES</h2>
              <div className="space-y-2">
                {[...state.requests]
                  .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                  .slice(0, 5)
                  .map((r) => (
                    <div key={r.id} className="flex items-center justify-between rounded-xl border border-black/10 bg-white p-3">
                      <div>
                        <div className="text-sm font-semibold text-black">
                          {r.items.map((i) => i.articleName).join(", ")}
                        </div>
                        <div className="text-xs text-black/50">
                          {formatDateISO(r.startDate)} → {formatDateISO(r.dueDate)}
                        </div>
                      </div>
                      <Badge variant={requestStatusToBadgeVariant(r.status)}>
                        {requestStatusLabel(r.status)}
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── ROOM TAB ──────────────────────────────────────────────── */}
      {tab === "salon" && (
        <div className="space-y-5">
          <div className="rounded-2xl border-2 border-uniclaretiana-yellow/50 bg-white p-6 shadow-sm">
            <div className="mb-5 text-base font-bold text-black">Nueva reserva de salón</div>

            {loadingRooms ? (
              <p className="text-sm text-black/50">Cargando salones...</p>
            ) : (
              <form onSubmit={submitRoom} className="space-y-4" autoComplete="off">
                {/* Salon selector */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold tracking-widest text-black/60">SALÓN</label>
                  <select className={INPUT} value={roomForm.salonId}
                    onChange={(e) => setRoomForm((p) => ({ ...p, salonId: e.target.value }))} required>
                    <option value="">Selecciona un salón...</option>
                    {rooms.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.nombre}{r.ubicacion ? ` — ${r.ubicacion}` : ""} · Cap. {r.capacidad} · {r.disponibleDesde}–{r.disponibleHasta}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date + times */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold tracking-widest text-black/60">FECHA</label>
                    <input type="date" className={INPUT} value={roomForm.fecha} min={today}
                      onChange={(e) => setRoomForm((p) => ({ ...p, fecha: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold tracking-widest text-black/60">HORA INICIO</label>
                    <input type="time" className={INPUT} value={roomForm.horaInicio}
                      onChange={(e) => setRoomForm((p) => ({ ...p, horaInicio: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold tracking-widest text-black/60">HORA FIN</label>
                    <input type="time" className={INPUT} value={roomForm.horaFin}
                      onChange={(e) => setRoomForm((p) => ({ ...p, horaFin: e.target.value }))} required />
                  </div>
                </div>

                {/* Note */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold tracking-widest text-black/60">NOTA (OPCIONAL)</label>
                  <textarea className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-uniclaretiana-yellow"
                    rows={2} placeholder="Describe el uso del salón..."
                    value={roomForm.nota}
                    onChange={(e) => setRoomForm((p) => ({ ...p, nota: e.target.value }))} />
                </div>

                {roomError && <p className="text-sm font-semibold text-red-600">{roomError}</p>}
                {roomSuccess && <p className="text-sm font-semibold text-green-600">✓ Reserva enviada correctamente.</p>}

                <button type="submit"
                  className="h-11 w-full rounded-xl bg-black text-sm font-bold text-white transition-colors hover:bg-black/80">
                  Enviar solicitud de reserva
                </button>
              </form>
            )}
          </div>

          {/* Room cards */}
          {rooms.length > 0 && (
            <div>
              <h2 className="mb-3 text-xs font-bold tracking-widest text-black/50">SALONES DISPONIBLES</h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {rooms.map((r) => (
                  <div key={r._id}
                    className={`cursor-pointer rounded-2xl border bg-white p-4 shadow-sm transition-all hover:shadow-md ${
                      roomForm.salonId === r._id
                        ? "border-uniclaretiana-yellow ring-2 ring-uniclaretiana-yellow/30"
                        : "border-black/10"
                    }`}
                    onClick={() => { setRoomForm((p) => ({ ...p, salonId: r._id })); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="font-semibold text-black">{r.nombre}</div>
                      <span className="rounded-full bg-black/[0.04] px-2 py-0.5 text-xs font-semibold text-black/60">Cap. {r.capacidad}</span>
                    </div>
                    {r.ubicacion && <div className="mt-0.5 text-xs text-black/50">{r.ubicacion}</div>}
                    <div className="mt-2 text-xs text-black/60">🕐 {r.disponibleDesde} – {r.disponibleHasta}</div>
                    {r.descripcion && <div className="mt-1 text-xs text-black/60">{r.descripcion}</div>}
                    {r.elementos && <div className="mt-1 text-xs text-black/50">Equip: {r.elementos}</div>}
                    <button type="button" onClick={(e) => { e.stopPropagation(); setRoomForm((p) => ({ ...p, salonId: r._id })); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className={`mt-3 w-full rounded-lg py-2 text-xs font-semibold transition-colors ${
                        roomForm.salonId === r._id ? "bg-uniclaretiana-yellow text-uniclaretiana-black" : "bg-black text-white hover:bg-black/80"
                      }`}>
                      {roomForm.salonId === r._id ? "✓ Seleccionado" : "Seleccionar"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* My reservations */}
          {reservations.length > 0 && (
            <div>
              <h2 className="mb-3 text-xs font-bold tracking-widest text-black/50">MIS RESERVAS</h2>
              <div className="space-y-2">
                {[...reservations].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 5).map((rv) => {
                  const color =
                    rv.estado === "RESERVADO" ? "bg-green-100 text-green-800"
                    : rv.estado === "RECHAZADA" || rv.estado === "CANCELADA" ? "bg-red-100 text-red-700"
                    : "bg-yellow-100 text-yellow-800";
                  const label =
                    rv.estado === "RESERVADO" ? "Aprobada"
                    : rv.estado === "RECHAZADA" ? "Rechazada"
                    : rv.estado === "CANCELADA" ? "Cancelada"
                    : "Pendiente";
                  return (
                    <div key={rv._id} className="flex items-center justify-between rounded-xl border border-black/10 bg-white p-3">
                      <div>
                        <div className="text-sm font-semibold text-black">{rv.nombreSalon}</div>
                        <div className="text-xs text-black/50">{rv.fecha} · {minutesToTime(rv.startMin)}–{minutesToTime(rv.endMin)}</div>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${color}`}>{label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SolicitarPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm text-black/50">Cargando...</div>}>
      <SolicitarContent />
    </Suspense>
  );
}
