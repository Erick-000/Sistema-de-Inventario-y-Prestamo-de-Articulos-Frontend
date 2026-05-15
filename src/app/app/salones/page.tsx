"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppState } from "@/state/app-state";
import { apiFetch, ApiError } from "@/lib/api/client";
import { ConfirmModal } from "@/components/ConfirmModal";
import { Modal } from "@/components/Modal";
import { Button } from "@/components/Button";

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
  salonId: string;
  nombreSalon: string;
  docenteId: string;
  nombreDocente: string;
  fecha: string;
  startMin: number;
  endMin: number;
  nota?: string;
  estado:
    | "PENDIENTE"
    | "APROBADA"
    | "RECHAZADA"
    | "CANCELADA"
    | "SOLICITADO"
    | "RESERVADO";
};

const dayLabels = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function minutesToTime(min: number) {
  const hh = String(Math.floor(min / 60)).padStart(2, "0");
  const mm = String(min % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

function toDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getMonday(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() - day + 1);
  return toDateInput(date);
}

function timeToMinutes(value: string) {
  const [hh, mm] = value.split(":").map(Number);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
  return hh * 60 + mm;
}

function getReservationStatusBadgeClass(estado: ReservationDto["estado"]) {
  switch (estado) {
    case "APROBADA":
    case "RESERVADO":
      return "border-emerald-500/30 bg-emerald-50 text-emerald-700";
    case "PENDIENTE":
    case "SOLICITADO":
      return "border-amber-500/30 bg-amber-50 text-amber-700";
    case "RECHAZADA":
      return "border-red-500/30 bg-red-50 text-red-700";
    case "CANCELADA":
      return "border-slate-500/30 bg-slate-100 text-slate-700";
    default:
      return "border-black/10 bg-black/[0.04] text-black/70";
  }
}

export default function SalonesPage() {
  const { state } = useAppState();
  const isAdmin = state.role === "admin";
  const isTeacher = state.role === "teacher";

  const [rooms, setRooms] = useState<RoomDto[]>([]);
  const [reservations, setReservations] = useState<ReservationDto[]>([]);
  const [weekReservations, setWeekReservations] = useState<ReservationDto[]>([]);
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date().toISOString().slice(0, 10)));
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const [roomForm, setRoomForm] = useState<{
    nombre: string;
    ubicacion: string;
    capacidad: number | "";
    descripcion: string;
    elementos: string;
    disponibleDesde: string;
    disponibleHasta: string;
    activo: boolean;
  }>({
    nombre: "",
    ubicacion: "",
    capacidad: "",
    descripcion: "",
    elementos: "",
    disponibleDesde: "07:00",
    disponibleHasta: "18:00",
    activo: true,
  });

  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);

  const [reservationForm, setReservationForm] = useState<{
    salonId: string;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    nota: string;
  }>({
    salonId: "",
    fecha: new Date().toISOString().slice(0, 10),
    horaInicio: "07:00",
    horaFin: "08:00",
    nota: "",
  });

  const [blockForm, setBlockForm] = useState({
    salonId: "",
    fecha: new Date().toISOString().slice(0, 10),
    horaInicio: "07:00",
    horaFin: "08:00",
    motivo: "",
  });

  const [cancelId, setCancelId] = useState<string | null>(null);

  // ── Reservation modal state (teacher) ─────────────────────────
  const [reservationModalRoom, setReservationModalRoom] = useState<RoomDto | null>(null);
  const [reservationModalError, setReservationModalError] = useState<string | null>(null);
  const [reservationModalSuccess, setReservationModalSuccess] = useState(false);
  const [availability, setAvailability] = useState<ReservationDto[]>([]);

  function openReservationModal(room: RoomDto) {
    setReservationModalRoom(room);
    setReservationForm({
      salonId: room._id,
      fecha: new Date().toISOString().slice(0, 10),
      horaInicio: room.disponibleDesde,
      horaFin: room.disponibleHasta,
      nota: "",
    });
    setReservationModalError(null);
    setReservationModalSuccess(false);
    setAvailability([]);
  }

  async function loadAvailability(salonId: string, fecha: string) {
    const data = await apiFetch<ReservationDto[]>(
      `/api/room-reservations/availability?salonId=${encodeURIComponent(salonId)}&fecha=${encodeURIComponent(fecha)}`,
    );
    setAvailability(data);
  }

  async function load() {
    setLoading(true);
    setError("");
    try {
      const roomsData = await apiFetch<RoomDto[]>("/api/rooms");
      setRooms(roomsData);

      if (isTeacher) {
        const mine = await apiFetch<ReservationDto[]>("/api/room-reservations/mine");
        setReservations(mine);
      } else {
        setReservations([]);
      }
      const week = await apiFetch<ReservationDto[]>(
        `/api/room-reservations/week?start=${encodeURIComponent(weekStart)}`,
      ).catch(() => []);
      setWeekReservations(week);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Error cargando salones";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart]);

  useEffect(() => {
    if (!reservationModalRoom || !reservationForm.fecha) return;
    loadAvailability(reservationModalRoom._id, reservationForm.fecha).catch(() => {
      setAvailability([]);
    });
  }, [reservationModalRoom, reservationForm.fecha]);

  const activeRooms = useMemo(() => rooms.filter((r) => r.activo), [rooms]);
  const weekDays = useMemo(() => {
    const start = new Date(`${weekStart}T00:00:00.000Z`);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setUTCDate(start.getUTCDate() + index);
      return toDateInput(date);
    });
  }, [weekStart]);

  const myReservations = useMemo(
    () =>
      [...reservations].sort((a, b) => {
        if (a.fecha !== b.fecha) return b.fecha.localeCompare(a.fecha);
        return a.startMin - b.startMin;
      }),
    [reservations],
  );

  const selectedReservationConflict = useMemo(() => {
    const startMin = timeToMinutes(reservationForm.horaInicio);
    const endMin = timeToMinutes(reservationForm.horaFin);
    if (startMin === null || endMin === null || endMin <= startMin) return false;
    return availability.some((item) => item.startMin < endMin && item.endMin > startMin);
  }, [availability, reservationForm.horaFin, reservationForm.horaInicio]);

  function moveWeek(delta: number) {
    const date = new Date(`${weekStart}T00:00:00.000Z`);
    date.setUTCDate(date.getUTCDate() + delta * 7);
    setWeekStart(toDateInput(date));
  }

  async function submitRoom(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (roomForm.disponibleDesde >= roomForm.disponibleHasta) {
      setError("La hora de inicio de disponibilidad debe ser anterior a la hora de fin.");
      return;
    }

    const capacidad = roomForm.capacidad === "" ? NaN : Number(roomForm.capacidad);
    if (!Number.isFinite(capacidad) || capacidad < 0) {
      setError("La capacidad debe ser un número válido.");
      return;
    }

    try {
      const payload = {
        nombre: roomForm.nombre,
        ubicacion: roomForm.ubicacion || undefined,
        capacidad,
        descripcion: roomForm.descripcion || undefined,
        elementos: roomForm.elementos || undefined,
        disponibleDesde: roomForm.disponibleDesde,
        disponibleHasta: roomForm.disponibleHasta,
        activo: roomForm.activo,
      };

      if (editingRoomId) {
        await apiFetch<RoomDto>(`/api/rooms/${editingRoomId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch<RoomDto>("/api/rooms", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setEditingRoomId(null);
      setRoomForm({
        nombre: "",
        ubicacion: "",
        capacidad: "",
        descripcion: "",
        elementos: "",
        disponibleDesde: "07:00",
        disponibleHasta: "18:00",
        activo: true,
      });

      await load();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "No se pudo guardar el salón";
      setError(msg);
    }
  }

  async function startEditRoom(r: RoomDto) {
    setEditingRoomId(r._id);
    setRoomForm({
      nombre: r.nombre,
      ubicacion: r.ubicacion ?? "",
      capacidad: r.capacidad,
      descripcion: r.descripcion ?? "",
      elementos: r.elementos ?? "",
      disponibleDesde: r.disponibleDesde,
      disponibleHasta: r.disponibleHasta,
      activo: r.activo,
    });
  }

  async function deactivateRoom(id: string) {
    setError("");
    try {
      await apiFetch(`/api/rooms/${id}`, { method: "DELETE" });
      await load();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "No se pudo desactivar el salón";
      setError(msg);
    }
  }

  async function submitReservation(e?: React.FormEvent) {
    e?.preventDefault();
    setReservationModalError(null);
    setReservationModalSuccess(false);
    setError("");

    if (reservationForm.horaInicio >= reservationForm.horaFin) {
      setReservationModalError("La hora de inicio debe ser anterior a la hora de fin.");
      return;
    }
    if (selectedReservationConflict) {
      setReservationModalError("El horario elegido cruza con una reserva existente.");
      return;
    }

    try {
      await apiFetch<ReservationDto>("/api/room-reservations", {
        method: "POST",
        body: JSON.stringify({
          salonId: reservationForm.salonId,
          fecha: reservationForm.fecha,
          horaInicio: reservationForm.horaInicio,
          horaFin: reservationForm.horaFin,
          nota: reservationForm.nota || undefined,
        }),
      });
      setReservationModalSuccess(true);
      await load();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "No se pudo crear la reserva";
      setReservationModalError(msg);
    }
  }

  async function cancelMine(id: string) {
    setError("");
    try {
      await apiFetch(`/api/room-reservations/${id}/cancel-mine`, { method: "PATCH" });
      await load();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "No se pudo cancelar";
      setError(msg);
    }
  }

  async function submitBlock(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!blockForm.salonId) {
      setError("Selecciona un salón para bloquear.");
      return;
    }
    if (blockForm.horaInicio >= blockForm.horaFin) {
      setError("La hora de inicio del bloqueo debe ser anterior a la hora de fin.");
      return;
    }
    if (blockForm.motivo.trim().length < 5) {
      setError("Escribe un motivo de al menos 5 caracteres.");
      return;
    }

    try {
      await apiFetch("/api/room-reservations/blocks", {
        method: "POST",
        body: JSON.stringify(blockForm),
      });
      setBlockForm({
        salonId: "",
        fecha: blockForm.fecha,
        horaInicio: "07:00",
        horaFin: "08:00",
        motivo: "",
      });
      await load();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "No se pudo crear el bloqueo";
      setError(msg);
    }
  }

  return (
    <main className="w-full p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Salones</h1>
        <p className="text-sm text-black/70">
          {isAdmin
            ? "Administra el catálogo de salones. Las reservas se revisan en Solicitudes."
            : isTeacher
              ? "Solicita y revisa tus reservas de salón."
              : "Consulta salones disponibles."}
        </p>
      </div>

      {error ? (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="text-sm text-black/70">Cargando...</div>
      ) : isTeacher ? (
        /* ── TEACHER LAYOUT ─────────────────────────────────── */
        <div className="space-y-6">
          {/* Salon cards */}
          <section className="rounded-[2rem] border border-black/5 bg-black/[0.02] p-1.5 shadow-sm transition-all duration-700 hover:bg-black/[0.04]">
            <div className="h-full rounded-[calc(1rem-0.25rem)] bg-white p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] ring-1 ring-black/5 sm:rounded-[calc(2rem-0.375rem)] sm:p-6">
              <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-black">Calendario semanal</h2>
                  <p className="text-xs font-semibold tracking-wide text-black/50">Reservas aprobadas o pendientes por día.</p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                  <Button variant="ghost" size="sm" onClick={() => moveWeek(-1)}>Anterior</Button>
                  <input
                    type="date"
                    className="col-span-2 h-9 w-full rounded-full border border-black/5 bg-black/[0.02] px-4 text-xs font-semibold outline-none ring-1 ring-inset ring-black/5 transition-all duration-300 focus:bg-white focus:ring-uniclaretiana-yellow sm:col-span-1 sm:w-auto"
                    value={weekStart}
                    onChange={(e) => setWeekStart(getMonday(e.target.value))}
                  />
                  <Button variant="ghost" size="sm" onClick={() => moveWeek(1)}>Siguiente</Button>
                </div>
              </div>
              <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 md:mx-0 md:px-0">
                <div className="grid min-w-[980px] grid-cols-7 gap-3 md:min-w-0">
                  {weekDays.map((date, index) => {
                    const items = weekReservations.filter((item) => item.fecha === date);
                    return (
                      <div
                        key={date}
                        className={`min-h-32 rounded-2xl border border-black/5 p-3 shadow-inner ${
                          items.length === 0 ? "bg-emerald-50/60" : "bg-amber-50/60"
                        }`}
                      >
                        <div className="text-xs font-bold text-black">{dayLabels[index]}</div>
                        <div className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-black/40">{date}</div>
                        <div className="mt-3 space-y-2">
                          {items.slice(0, 4).map((item) => (
                            <div
                              key={item._id}
                              className={`rounded-xl border bg-white p-2 shadow-sm ${getReservationStatusBadgeClass(
                                item.estado,
                              )}`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="truncate text-[11px] font-bold">{item.nombreSalon}</div>
                                  <div className="text-[10px] font-semibold opacity-80">
                                    {minutesToTime(item.startMin)}-{minutesToTime(item.endMin)}
                                  </div>
                                </div>
                                <span className="shrink-0 rounded-full border border-current/20 px-2 py-0.5 text-[10px] font-bold">
                                  {item.estado}
                                </span>
                              </div>
                            </div>
                          ))}
                          {items.length === 0 ? (
                            <div className="inline-flex items-center rounded-full border border-emerald-500/20 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                              Libre
                            </div>
                          ) : null}
                          {items.length > 4 ? (
                            <div className="text-[10px] font-bold text-black/40">+{items.length - 4} más</div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {activeRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-black/[0.01] p-10 text-center">
              <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-black/[0.04] text-black/40">
                <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18"/><path d="M9 8h1"/><path d="M9 12h1"/><path d="M9 16h1"/><path d="M14 8h1"/><path d="M14 12h1"/><path d="M14 16h1"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/>
                </svg>
              </span>
              <div className="text-sm font-semibold text-black/70">No hay salones disponibles</div>
              <div className="mt-1 text-xs text-black/50">Por el momento no hay espacios activos para reservar.</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {activeRooms.map((r) => (
                <div key={r._id} className="group rounded-[2rem] border border-black/5 bg-black/[0.02] p-1.5 shadow-sm transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:bg-black/[0.04] hover:shadow-md">
                  <div className="flex h-full flex-col rounded-[calc(1rem-0.25rem)] bg-white p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] ring-1 ring-black/5 sm:rounded-[calc(2rem-0.375rem)] sm:p-6">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-black">{r.nombre}</div>
                      <span className="shrink-0 rounded-full bg-black/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-black/60 shadow-sm ring-1 ring-inset ring-black/5">
                        CAP. {r.capacidad}
                      </span>
                    </div>
                    {r.ubicacion ? <div className="mt-2 text-[11px] font-semibold tracking-wide text-black/50 uppercase">{r.ubicacion}</div> : null}
                    <div className="mt-4 text-xs font-semibold text-black/60">
                      Disponible: {r.disponibleDesde} – {r.disponibleHasta}
                    </div>
                    {r.descripcion ? <div className="mt-1 text-xs font-medium text-black/60">{r.descripcion}</div> : null}
                    {r.elementos ? <div className="mt-2 rounded-xl border border-black/5 bg-black/[0.02] p-3 text-xs font-semibold text-black/60 shadow-inner">Equipamiento: {r.elementos}</div> : null}
                    <div className="mt-auto pt-6">
                      <button
                        type="button"
                        className="w-full rounded-full bg-black py-3 text-sm font-bold text-white shadow-md transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] hover:bg-[#1a1a1a] hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)] active:scale-[0.98]"
                        onClick={() => openReservationModal(r)}
                      >
                        SOLICITAR RESERVA
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Teacher's own reservations */}
          <div>
            <h2 className="mb-3 text-xs font-bold tracking-widest text-black/50">MIS RESERVAS</h2>
            {myReservations.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-black/[0.01] p-10 text-center">
                <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-black/[0.04] text-black/40">
                  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                  </svg>
                </span>
                <div className="text-sm font-semibold text-black/70">No tienes reservas</div>
                <div className="mt-1 text-xs text-black/50">Tus próximas reservas aparecerán aquí.</div>
              </div>
            ) : (
              <div className="space-y-2">
                {myReservations.map((rv) => (
                  <div key={rv._id} className="flex items-center justify-between rounded-xl border border-black/10 bg-white p-4">
                    <div>
                      <div className="font-semibold text-black">{rv.nombreSalon}</div>
                      <div className="text-xs text-black/60">
                        {rv.fecha} · {minutesToTime(rv.startMin)} – {minutesToTime(rv.endMin)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`ml-2 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${getReservationStatusBadgeClass(
                          rv.estado,
                        )}`}
                      >
                        {rv.estado}
                      </span>
                      {rv.estado === "SOLICITADO" ? (
                        <button
                          type="button"
                          className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold hover:bg-black/[0.03]"
                          onClick={() => setCancelId(rv._id)}
                        >
                          Cancelar
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ── ADMIN LAYOUT ───────────────────────────────────── */
        <div className="space-y-4">
          <section className="rounded-[2rem] border border-black/5 bg-black/[0.02] p-1.5 shadow-sm transition-all duration-700 hover:bg-black/[0.04]">
            <div className="h-full rounded-[calc(1rem-0.25rem)] bg-white p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] ring-1 ring-black/5 sm:rounded-[calc(2rem-0.375rem)] sm:p-6">
              <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <h2 className="text-lg font-bold text-black">Calendario semanal</h2>
                  <p className="text-xs font-semibold tracking-wide text-black/50">Reservas pendientes y aprobadas. Para aprobar o rechazar, ve a Solicitudes.</p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                  <Button variant="ghost" size="sm" onClick={() => moveWeek(-1)}>Anterior</Button>
                  <input
                    type="date"
                    className="col-span-2 h-9 w-full rounded-full border border-black/5 bg-black/[0.02] px-4 text-xs font-semibold outline-none ring-1 ring-inset ring-black/5 transition-all duration-300 focus:bg-white focus:ring-uniclaretiana-yellow sm:col-span-1 sm:w-auto"
                    value={weekStart}
                    onChange={(e) => setWeekStart(getMonday(e.target.value))}
                  />
                  <Button variant="ghost" size="sm" onClick={() => moveWeek(1)}>Siguiente</Button>
                </div>
              </div>
              <div className="-mx-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 md:mx-0 md:px-0">
                <div className="grid min-w-[980px] grid-cols-7 gap-3 md:min-w-0">
                  {weekDays.map((date, index) => {
                    const items = weekReservations.filter((item) => item.fecha === date);
                    return (
                      <div
                        key={date}
                        className={`min-h-36 rounded-2xl border border-black/5 p-3 shadow-inner ${
                          items.length === 0 ? "bg-emerald-50/60" : "bg-amber-50/60"
                        }`}
                      >
                        <div className="text-xs font-bold text-black">{dayLabels[index]}</div>
                        <div className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-black/40">{date}</div>
                        <div className="mt-3 space-y-2">
                          {items.map((item) => (
                            <div
                              key={item._id}
                              className={`rounded-xl border bg-white p-2 shadow-sm ${getReservationStatusBadgeClass(
                                item.estado,
                              )}`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="truncate text-[11px] font-bold">{item.nombreSalon}</div>
                                  <div className="truncate text-[10px] font-semibold opacity-80">
                                    {item.nombreDocente === "Bloqueo institucional"
                                      ? "Bloqueo / mantenimiento"
                                      : item.nombreDocente}
                                  </div>
                                  <div className="text-[10px] font-semibold opacity-70">
                                    {minutesToTime(item.startMin)}-{minutesToTime(item.endMin)}
                                  </div>
                                </div>
                                <span className="shrink-0 rounded-full border border-current/20 px-2 py-0.5 text-[10px] font-bold">
                                  {item.estado}
                                </span>
                              </div>
                            </div>
                          ))}
                          {items.length === 0 ? (
                            <div className="inline-flex items-center rounded-full border border-emerald-500/20 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                              Libre
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          <section className="rounded-2xl border border-black/10 bg-white p-4 xl:col-span-7">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Salones</h2>
              <span className="text-xs text-black/50">{rooms.length} total</span>
            </div>

            <div className="space-y-2">
              {rooms.map((r) => (
                <div key={r._id} className="rounded-xl border border-black/10 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">
                        {r.nombre}{" "}
                        {!r.activo ? (
                          <span className="ml-2 rounded-full bg-black/5 px-2 py-0.5 text-xs text-black/60">
                            Inactivo
                          </span>
                        ) : null}
                      </div>
                      <div className="text-sm text-black/70">
                        Capacidad: {r.capacidad}
                        {r.ubicacion ? ` · ${r.ubicacion}` : ""}
                      </div>
                      <div className="text-sm text-black/70">
                        Disponible: {r.disponibleDesde} - {r.disponibleHasta}
                      </div>
                      {r.descripcion ? (
                        <div className="mt-2 text-sm text-black/70">{r.descripcion}</div>
                      ) : null}
                      {r.elementos ? (
                        <div className="mt-2 text-sm text-black/70">Elementos: {r.elementos}</div>
                      ) : null}
                    </div>

                    {isAdmin ? (
                      <div className="flex shrink-0 flex-col gap-2">
                        <button
                          type="button"
                          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-semibold hover:bg-black/[0.03]"
                          onClick={() => startEditRoom(r).catch(() => {})}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-semibold hover:bg-black/[0.03]"
                          onClick={() => deactivateRoom(r._id).catch(() => {})}
                        >
                          Desactivar
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}

              {rooms.length === 0 ? (
                <div className="rounded-xl border border-dashed border-black/15 p-6 text-sm text-black/60">
                  No hay salones.
                </div>
              ) : null}
            </div>
          </section>

          <section className="space-y-4 xl:col-span-5">
            {isAdmin ? (
              <>
              <div className="rounded-2xl border border-black/10 bg-white p-4">
                <h2 className="mb-3 text-lg font-semibold">
                  {editingRoomId ? "Editar salón" : "Crear salón"}
                </h2>

                <form className="grid grid-cols-1 gap-3" onSubmit={submitRoom} autoComplete="off">
                  <input
                    className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
                    type="text"
                    autoComplete="off"
                    placeholder="Nombre"
                    value={roomForm.nombre}
                    onChange={(e) => setRoomForm((p) => ({ ...p, nombre: e.target.value }))}
                    required
                  />

                  <input
                    className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
                    type="text"
                    autoComplete="off"
                    placeholder="Ubicación (opcional)"
                    value={roomForm.ubicacion}
                    onChange={(e) => setRoomForm((p) => ({ ...p, ubicacion: e.target.value }))}
                  />

                  <label className="block space-y-1">
                    <span className="text-xs font-semibold text-black/70">
                      Capacidad (personas)
                    </span>
                    <input
                      className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
                      type="number"
                      autoComplete="off"
                      min={0}
                      step={1}
                      placeholder="Ej: 30"
                      value={roomForm.capacidad}
                      onChange={(e) =>
                        setRoomForm((p) => ({
                          ...p,
                          capacidad: e.target.value === "" ? "" : Number(e.target.value),
                        }))
                      }
                      required
                    />
                  </label>

                  <textarea
                    className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
                    placeholder="Descripción (opcional)"
                    value={roomForm.descripcion}
                    onChange={(e) => setRoomForm((p) => ({ ...p, descripcion: e.target.value }))}
                    rows={2}
                  />

                  <textarea
                    className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
                    placeholder="Elementos / anotaciones (opcional)"
                    value={roomForm.elementos}
                    onChange={(e) => setRoomForm((p) => ({ ...p, elementos: e.target.value }))}
                    rows={2}
                  />

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-black/70">
                        Disponible desde
                      </label>
                      <input
                        className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
                        type="time"
                        value={roomForm.disponibleDesde}
                        onChange={(e) => setRoomForm((p) => ({ ...p, disponibleDesde: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-black/70">
                        Disponible hasta
                      </label>
                      <input
                        className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
                        type="time"
                        value={roomForm.disponibleHasta}
                        onChange={(e) => setRoomForm((p) => ({ ...p, disponibleHasta: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-sm text-black/70">
                    <input
                      type="checkbox"
                      checked={roomForm.activo}
                      onChange={(e) => setRoomForm((p) => ({ ...p, activo: e.target.checked }))}
                    />
                    Activo
                  </label>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="submit"
                      className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white"
                    >
                      Guardar
                    </button>

                    {editingRoomId ? (
                      <button
                        type="button"
                        className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold"
                        onClick={() => {
                          setEditingRoomId(null);
                          setRoomForm({
                            nombre: "",
                            ubicacion: "",
                            capacidad: "",
                            descripcion: "",
                            elementos: "",
                            disponibleDesde: "07:00",
                            disponibleHasta: "18:00",
                            activo: true,
                          });
                        }}
                      >
                        Cancelar
                      </button>
                    ) : null}
                  </div>
                </form>
              </div>
              <div className="rounded-2xl border border-black/10 bg-white p-4">
                <h2 className="mb-1 text-lg font-semibold">Bloquear salón</h2>
                <p className="mb-3 text-xs text-black/50">
                  Úsalo para mantenimiento, eventos o cierres institucionales.
                </p>
                <form className="grid grid-cols-1 gap-3" onSubmit={submitBlock} autoComplete="off">
                  <select
                    className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
                    value={blockForm.salonId}
                    onChange={(e) => setBlockForm((p) => ({ ...p, salonId: e.target.value }))}
                    required
                  >
                    <option value="">Selecciona un salón</option>
                    {activeRooms.map((room) => (
                      <option key={room._id} value={room._id}>
                        {room.nombre}
                      </option>
                    ))}
                  </select>
                  <input
                    className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
                    type="date"
                    value={blockForm.fecha}
                    onChange={(e) => setBlockForm((p) => ({ ...p, fecha: e.target.value }))}
                    required
                  />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
                      type="time"
                      value={blockForm.horaInicio}
                      onChange={(e) => setBlockForm((p) => ({ ...p, horaInicio: e.target.value }))}
                      required
                    />
                    <input
                      className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
                      type="time"
                      value={blockForm.horaFin}
                      onChange={(e) => setBlockForm((p) => ({ ...p, horaFin: e.target.value }))}
                      required
                    />
                  </div>
                  <textarea
                    className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm"
                    rows={2}
                    placeholder="Motivo del bloqueo"
                    value={blockForm.motivo}
                    onChange={(e) => setBlockForm((p) => ({ ...p, motivo: e.target.value }))}
                    required
                  />
                  <Button type="submit" variant="secondary">
                    Crear bloqueo
                  </Button>
                </form>
              </div>
              </>
            ) : null}
          </section>
          </div>
        </div>
      )}

      {/* Modals */}
      <ConfirmModal
        open={cancelId !== null}
        title="Cancelar reserva"
        description="¿Estás seguro de que deseas cancelar esta reserva?"
        confirmText="Sí, cancelar"
        cancelText="No, volver"
        onConfirm={() => {
          if (!cancelId) return;
          cancelMine(cancelId).catch(() => {});
          setCancelId(null);
        }}
        onClose={() => setCancelId(null)}
      />

      {/* Reservation modal — teacher */}
      <Modal
        open={reservationModalRoom !== null}
        title={`Solicitar reserva — ${reservationModalRoom?.nombre ?? ""}`}
        onClose={() => setReservationModalRoom(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setReservationModalRoom(null)}>
              Cancelar
            </Button>
            <Button
              variant="secondary"
              disabled={reservationModalSuccess || reservationForm.horaInicio >= reservationForm.horaFin || selectedReservationConflict}
              onClick={() => { void submitReservation(); }}
            >
              Enviar solicitud
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-sm">
          {reservationModalRoom && (
            <div className="rounded-xl border border-black/10 bg-black/[0.02] px-4 py-3 text-xs text-black/70">
              Capacidad: <strong>{reservationModalRoom.capacidad}</strong>
              {reservationModalRoom.ubicacion ? ` · ${reservationModalRoom.ubicacion}` : ""}
              {" · "}Horario disponible: <strong>{reservationModalRoom.disponibleDesde} – {reservationModalRoom.disponibleHasta}</strong>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold tracking-widest text-black/60">FECHA</label>
            <input
              type="date"
              className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-uniclaretiana-yellow"
              value={reservationForm.fecha}
              min={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setReservationForm((p) => ({ ...p, fecha: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-widest text-black/60">HORA INICIO</label>
              <input
                type="time"
                className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-uniclaretiana-yellow"
                value={reservationForm.horaInicio}
                onChange={(e) => setReservationForm((p) => ({ ...p, horaInicio: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-widest text-black/60">HORA FIN</label>
              <input
                type="time"
                className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-uniclaretiana-yellow"
                value={reservationForm.horaFin}
                onChange={(e) => setReservationForm((p) => ({ ...p, horaFin: e.target.value }))}
              />
            </div>
          </div>

          {availability.length > 0 ? (
            <div className="rounded-xl border border-black/10 bg-black/[0.015] p-3">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-black/50">
                Horarios ocupados
              </div>
              <div className="flex flex-wrap gap-2">
                {availability.map((item) => (
                  <span
                    key={`${item._id}-${item.startMin}`}
                    className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-xs font-semibold text-black/70"
                  >
                    {minutesToTime(item.startMin)}-{minutesToTime(item.endMin)}
                  </span>
                ))}
              </div>
              {selectedReservationConflict ? (
                <p className="mt-2 text-xs font-semibold text-red-600">
                  El rango seleccionado cruza con uno de estos horarios.
                </p>
              ) : null}
            </div>
          ) : (
            <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-700">
              No hay reservas registradas para ese salón en la fecha seleccionada.
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold tracking-widest text-black/60">NOTA (OPCIONAL)</label>
            <textarea
              className="w-full resize-none rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-uniclaretiana-yellow"
              rows={2}
              placeholder="Describe el uso del salón..."
              value={reservationForm.nota}
              onChange={(e) => setReservationForm((p) => ({ ...p, nota: e.target.value }))}
            />
          </div>

          {reservationModalError ? (
            <p className="text-xs font-semibold text-red-600">{reservationModalError}</p>
          ) : null}
          {reservationModalSuccess ? (
            <p className="text-xs font-semibold text-green-600">Reserva enviada correctamente.</p>
          ) : null}
        </div>
      </Modal>
    </main>
  );
}
