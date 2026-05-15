"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";
import { SearchInput } from "@/components/SearchInput";
import { Table } from "@/components/Table";
import { Modal } from "@/components/Modal";
import { StatCard } from "@/components/StatCard";
import { apiFetch } from "@/lib/api/client";
import { requestStatusLabel, requestStatusToBadgeVariant } from "@/lib/ui/status";
import type { LoanRequestStatus } from "@/lib/types/requests";

type UserDto = {
  _id: string;
  nombreCompleto: string;
  programa?: string | null;
  correo: string;
  rol: "docente" | "admin";
  bloqueado: boolean;
  createdAt?: string;
};

type ProfileLoan = {
  _id: string;
  estado: LoanRequestStatus;
  items?: Array<{ nombreArticulo?: string; cantidad?: number }>;
  fechaInicio?: string;
  fechaLimite?: string;
  createdAt?: string;
};

type ProfileReservation = {
  _id: string;
  nombreSalon: string;
  fecha: string;
  startMin: number;
  endMin: number;
  estado: "SOLICITADO" | "RESERVADO" | "RECHAZADA" | "CANCELADA";
  createdAt?: string;
};

type ProfileAudit = {
  _id: string;
  accion: string;
  actorNombre?: string;
  createdAt?: string;
};

type UserProfile = {
  user: UserDto;
  loans: ProfileLoan[];
  reservations: ProfileReservation[];
  audit: ProfileAudit[];
};

function minutesToTime(value: number) {
  const hh = String(Math.floor(value / 60)).padStart(2, "0");
  const mm = String(value % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function UsuariosPage() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [passwordUser, setPasswordUser] = useState<UserDto | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      setUsers(await apiFetch<UserDto[]>("/api/users"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los usuarios");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load().catch(() => {});
  }, []);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((user) => {
      if (!q) return true;
      return `${user.nombreCompleto} ${user.correo} ${user.programa ?? ""} ${user.rol}`
        .toLowerCase()
        .includes(q);
    });
  }, [query, users]);

  async function updateBlocked(user: UserDto, blocked: boolean) {
    await apiFetch<UserDto>(`/api/users/${user._id}/block`, {
      method: "PATCH",
      body: JSON.stringify({ blocked }),
    });
    await load();
  }

  async function updateTeacherPassword() {
    if (!passwordUser) return;
    if (newPassword.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setPasswordSaving(true);
    setPasswordError("");
    try {
      await apiFetch(`/api/users/${passwordUser._id}/password`, {
        method: "PATCH",
        body: JSON.stringify({ password: newPassword }),
      });
      setPasswordUser(null);
      setNewPassword("");
      await load();
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "No se pudo cambiar la contraseña");
    } finally {
      setPasswordSaving(false);
    }
  }

  async function openProfile(user: UserDto) {
    setProfileOpen(true);
    setProfileLoading(true);
    setProfile(null);
    try {
      const data = await apiFetch<UserProfile>(`/api/users/${user._id}/profile`);
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar el perfil");
    } finally {
      setProfileLoading(false);
    }
  }

  const profileSummary = useMemo(() => {
    const loans = profile?.loans ?? [];
    const reservations = profile?.reservations ?? [];
    return {
      activeLoans: loans.filter((loan) => loan.estado === "ACTIVO").length,
      overdueLoans: loans.filter((loan) => loan.estado === "VENCIDO").length,
      pending: [
        ...loans.filter((loan) => loan.estado === "SOLICITADO"),
        ...reservations.filter((reservation) => reservation.estado === "SOLICITADO"),
      ].length,
      reservations: reservations.length,
    };
  }, [profile]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Usuarios"
        description="Gestión básica de docentes y administradores."
        right={
          <div className="w-full md:max-w-sm">
            <SearchInput
              value={query}
              onChange={setQuery}
              placeholder="Buscar por nombre, correo, rol o programa"
            />
          </div>
        }
      />

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      <Table headers={["Usuario", "Rol", "Programa", "Estado", "Acciones"]}>
        {rows.map((user) => (
          <tr key={user._id} className="hover:bg-black/[0.02]">
            <td className="px-5 py-4 align-top">
              <div className="text-sm font-semibold text-black">{user.nombreCompleto}</div>
              <div className="mt-0.5 text-xs text-black/50">{user.correo}</div>
            </td>
            <td className="px-5 py-4 align-top text-sm font-semibold capitalize text-black/70">
              {user.rol}
            </td>
            <td className="px-5 py-4 align-top text-sm text-black/70">
              {user.programa ?? "Sin programa"}
            </td>
            <td className="px-5 py-4 align-top">
              <Badge variant={user.bloqueado ? "blocked" : "returned"}>
                {user.bloqueado ? "Bloqueado" : "Activo"}
              </Badge>
            </td>
            <td className="px-5 py-4 align-top">
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="ghost" onClick={() => { void openProfile(user); }}>
                  Perfil
                </Button>
                {user.rol === "admin" ? (
                  <span className="text-xs font-semibold text-black/40">Protegido</span>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setPasswordUser(user);
                        setNewPassword("");
                        setPasswordError("");
                      }}
                    >
                      Cambiar contraseña
                    </Button>
                    <Button
                      variant={user.bloqueado ? "secondary" : "ghost"}
                      onClick={() => {
                        void updateBlocked(user, !user.bloqueado);
                      }}
                    >
                      {user.bloqueado ? "Desbloquear" : "Bloquear"}
                    </Button>
                  </>
                )}
              </div>
            </td>
          </tr>
        ))}
      </Table>

      {!loading && rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/15 bg-black/[0.01] p-10 text-center">
          <div className="text-sm font-semibold text-black/70">No se encontraron usuarios</div>
          <div className="mt-1 text-xs text-black/50">Ajusta la búsqueda para ver otros registros.</div>
        </div>
      ) : null}

      {loading ? <div className="text-sm text-black/50">Cargando usuarios...</div> : null}

      <Modal
        open={profileOpen}
        title={`Perfil — ${profile?.user.nombreCompleto ?? "Usuario"}`}
        size="xl"
        onClose={() => setProfileOpen(false)}
      >
        {profileLoading ? (
          <div className="text-sm text-black/50">Cargando perfil...</div>
        ) : profile ? (
          <div className="space-y-5">
            <div className="rounded-xl border border-black/10 bg-black/[0.015] p-4">
              <div className="text-sm font-semibold text-black">{profile.user.nombreCompleto}</div>
              <div className="mt-1 text-xs text-black/50">{profile.user.correo}</div>
              <div className="mt-1 text-xs text-black/50">{profile.user.programa ?? "Sin programa"}</div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <StatCard label="ACTIVOS" value={profileSummary.activeLoans} hint="Préstamos activos" />
              <StatCard label="VENCIDOS" value={profileSummary.overdueLoans} hint="Requieren atención" />
              <StatCard label="PENDIENTES" value={profileSummary.pending} hint="Solicitudes abiertas" />
              <StatCard label="RESERVAS" value={profileSummary.reservations} hint="Historial de salones" />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <section className="rounded-xl border border-black/10 bg-white p-4">
                <h3 className="mb-3 text-sm font-semibold text-black">Préstamos recientes</h3>
                <div className="space-y-2">
                  {profile.loans.slice(0, 8).map((loan) => (
                    <div key={loan._id} className="rounded-lg border border-black/10 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-black">
                            {(loan.items ?? []).map((item) => item.nombreArticulo).filter(Boolean).join(", ") || "Préstamo"}
                          </div>
                          <div className="text-xs text-black/50">
                            {loan.fechaInicio ? new Date(loan.fechaInicio).toISOString().slice(0, 10) : ""} → {loan.fechaLimite ? new Date(loan.fechaLimite).toISOString().slice(0, 10) : ""}
                          </div>
                        </div>
                        <Badge variant={requestStatusToBadgeVariant(loan.estado)}>
                          {requestStatusLabel(loan.estado)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {profile.loans.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-black/15 p-4 text-center text-sm text-black/50">
                      Sin préstamos registrados.
                    </div>
                  ) : null}
                </div>
              </section>

              <section className="rounded-xl border border-black/10 bg-white p-4">
                <h3 className="mb-3 text-sm font-semibold text-black">Reservas recientes</h3>
                <div className="space-y-2">
                  {profile.reservations.slice(0, 8).map((reservation) => (
                    <div key={reservation._id} className="rounded-lg border border-black/10 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-black">{reservation.nombreSalon}</div>
                          <div className="text-xs text-black/50">
                            {reservation.fecha} · {minutesToTime(reservation.startMin)}-{minutesToTime(reservation.endMin)}
                          </div>
                        </div>
                        <span className="rounded-full border border-black/10 bg-black/[0.03] px-2 py-1 text-[10px] font-semibold text-black/60">
                          {reservation.estado}
                        </span>
                      </div>
                    </div>
                  ))}
                  {profile.reservations.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-black/15 p-4 text-center text-sm text-black/50">
                      Sin reservas registradas.
                    </div>
                  ) : null}
                </div>
              </section>
            </div>

            <section className="rounded-xl border border-black/10 bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold text-black">Eventos administrativos</h3>
              <div className="space-y-2">
                {profile.audit.map((event) => (
                  <div key={event._id} className="flex items-center justify-between rounded-lg border border-black/10 p-3">
                    <div>
                      <div className="text-sm font-semibold text-black">{event.accion}</div>
                      <div className="text-xs text-black/50">
                        {event.actorNombre ? `Por ${event.actorNombre}` : "Sistema"}
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-black/50">
                      {event.createdAt ? new Date(event.createdAt).toLocaleString("es-CO") : ""}
                    </div>
                  </div>
                ))}
                {profile.audit.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-black/15 p-4 text-center text-sm text-black/50">
                    Sin eventos administrativos.
                  </div>
                ) : null}
              </div>
            </section>
          </div>
        ) : (
          <div className="text-sm text-black/50">No se pudo cargar el perfil.</div>
        )}
      </Modal>

      <Modal
        open={!!passwordUser}
        title={`Cambiar contraseña — ${passwordUser?.nombreCompleto ?? "Docente"}`}
        onClose={() => {
          setPasswordUser(null);
          setNewPassword("");
          setPasswordError("");
        }}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setPasswordUser(null);
                setNewPassword("");
                setPasswordError("");
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="secondary"
              disabled={newPassword.length < 6 || passwordSaving}
              onClick={() => {
                void updateTeacherPassword();
              }}
            >
              {passwordSaving ? "Guardando..." : "Guardar contraseña"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-black/10 bg-black/[0.015] p-4">
            <div className="text-sm font-semibold text-black">{passwordUser?.nombreCompleto}</div>
            <div className="mt-1 text-xs text-black/50">{passwordUser?.correo}</div>
          </div>
          <label className="block space-y-2">
            <span className="text-xs font-semibold tracking-widest text-black/60">
              NUEVA CONTRASEÑA
            </span>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              minLength={6}
              className="h-12 w-full rounded-xl border border-black/10 bg-white px-4 text-sm font-semibold text-black outline-none focus:border-uniclaretiana-yellow"
              placeholder="Mínimo 6 caracteres"
            />
          </label>
          <div className="rounded-xl border border-black/10 bg-black/[0.02] px-4 py-3 text-xs font-semibold text-black/55">
            El docente deberá cambiar esta contraseña al iniciar sesión.
          </div>
          {passwordError ? (
            <div className="rounded-xl border border-red-500/30 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {passwordError}
            </div>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
