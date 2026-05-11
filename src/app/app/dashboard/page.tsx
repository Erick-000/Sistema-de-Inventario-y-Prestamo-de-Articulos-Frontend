"use client";

import Link from "next/link";
import { Badge } from "@/components/Badge";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { IconAlert, IconBox, IconClock, IconInbox, IconInventory } from "@/components/Icons";
import { useAppState } from "@/state/app-state";
import {
  requestStatusLabel,
  requestStatusToBadgeVariant,
} from "@/lib/ui/status";
import { getUser } from "@/lib/auth/session";
import { DashboardCharts } from "@/components/DashboardCharts";
import { formatDateISO } from "@/lib/ui/format";
import { apiFetch } from "@/lib/api/client";

// ─── Teacher Dashboard ────────────────────────────────────────────────────────
function TeacherDashboard() {
  const { state } = useAppState();
  const user = getUser();

  // Teacher only sees their own requests
  const myRequests = state.requests;
  const myActive  = myRequests.filter((r) => r.type === "article" && r.status === "ACTIVO").length;
  const myOverdue = myRequests.filter((r) => r.status === "VENCIDO").length;
  const myPending = myRequests.filter((r) => r.status === "SOLICITADO" || r.status === "RESERVADO").length;
  const recent    = [...myRequests].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const today = new Date().toISOString().slice(0, 10);
  const todayItems = myRequests
    .filter((r) => r.type === "article" && r.status === "ACTIVO" && r.dueDate === today)
    .sort((a, b) => (a.endTime ?? "").localeCompare(b.endTime ?? ""));
  const upcomingRooms = myRequests
    .filter((r) => r.type === "room" && (r.status === "SOLICITADO" || r.status === "RESERVADO") && r.startDate >= today)
    .sort((a, b) => `${a.startDate}${a.startTime ?? ""}`.localeCompare(`${b.startDate}${b.startTime ?? ""}`))
    .slice(0, 4);

  return (
    <div className="space-y-12 pb-24 animate-[slide-up_0.8s_cubic-bezier(0.16,1,0.3,1)]">
      <PageHeader
        title={`Hola, ${user?.name ?? "Docente"}`}
        description="Bienvenido al sistema de inventario y préstamos."
      />

      {/* Overdue warning */}
      {myOverdue > 0 ? (
        <div className="rounded-xl border border-red-500/30 bg-red-50 p-4 text-sm text-red-700">
          <div className="flex items-center gap-2 font-bold">
            <IconAlert className="h-5 w-5" />
            Tienes préstamos vencidos
          </div>
          <div className="mt-1">
            Por favor, solicita la devolución lo antes posible.
          </div>
        </div>
      ) : null}



      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard
          label="EN CURSO"
          value={myActive}
          hint="Préstamos activos ahora"
          icon={<IconClock className="h-5 w-5" />}
        />
        <StatCard
          label="PENDIENTES"
          value={myPending}
          hint="Artículos y salones por confirmar"
          icon={<IconInbox className="h-5 w-5" />}
        />
        <StatCard
          label="VENCIDOS"
          value={myOverdue}
          hint="Requieren devolución urgente"
          icon={<IconAlert className="h-5 w-5" />}
        />
      </div>

      <Card title="Hoy">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-black/5 bg-black/[0.02] p-5">
            <div className="text-xs font-semibold tracking-widest text-black/50">ARTÍCULOS ACTIVOS</div>
            <div className="mt-3 space-y-2">
              {todayItems.slice(0, 4).map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-semibold text-black">{item.items[0]?.articleName}</span>
                  <span className="text-xs font-semibold text-black/50">{item.endTime ?? "Hoy"}</span>
                </div>
              ))}
              {todayItems.length === 0 ? (
                <div className="text-sm text-black/50">No tienes artículos activos para devolver hoy.</div>
              ) : null}
            </div>
          </div>
          <div className="rounded-2xl border border-black/5 bg-black/[0.02] p-5">
            <div className="text-xs font-semibold tracking-widest text-black/50">RESERVAS PRÓXIMAS</div>
            <div className="mt-3 space-y-2">
              {upcomingRooms.map((room) => (
                <div key={room.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-semibold text-black">{room.items[0]?.articleName}</span>
                  <span className="text-xs font-semibold text-black/50">{room.startDate} · {room.startTime}</span>
                </div>
              ))}
              {upcomingRooms.length === 0 ? (
                <div className="text-sm text-black/50">No tienes reservas próximas.</div>
              ) : null}
            </div>
          </div>
        </div>
      </Card>

      {/* Recent requests */}
      <Card title="Mis solicitudes recientes">
        {recent.length === 0 ? (
          <div className="rounded-xl border border-dashed border-black/15 p-6 text-center text-sm text-black/50">
            No tienes solicitudes aún.{" "}
            <Link href="/app/prestamos" className="font-semibold underline hover:text-black">
              Crea una ahora
            </Link>
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            {recent.map((r) => (
              <div
                key={r.id}
                className="flex items-start justify-between gap-4 rounded-lg border border-black/10 p-3"
              >
                <div className="min-w-0">
                  <div className="truncate font-semibold text-black">
                    {r.type === "room" ? "Reserva de salón" : "Préstamo"} · {r.items.map((i) => i.articleName).join(", ")}
                  </div>
                  <div className="mt-0.5 text-xs text-black/50">
                    {formatDateISO(r.startDate)}
                    {r.type === "article"
                      ? r.startTime && r.endTime
                        ? ` · ${r.startTime}-${r.endTime}`
                        : ` → ${formatDateISO(r.dueDate)}`
                      : r.startTime && r.endTime
                        ? ` · ${r.startTime}-${r.endTime}`
                        : ""}
                  </div>
                  {r.adminNote ? (
                    <div className="mt-1 text-xs text-black/60 italic">Nota: {r.adminNote}</div>
                  ) : null}
                </div>
                <Badge variant={requestStatusToBadgeVariant(r.status)}>
                  {requestStatusLabel(r.status)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Inventory link */}
      <Link
        href="/app/inventario"
        className="flex items-center justify-between rounded-2xl border border-black/10 bg-white p-4 shadow-sm hover:border-black/20 hover:shadow-md transition-all"
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-black/[0.04]">
            <IconInventory className="h-5 w-5 text-black/70" />
          </span>
          <div>
            <div className="text-sm font-semibold text-black">Ver catálogo de inventario</div>
            <div className="text-xs text-black/50">Explora los artículos disponibles para préstamo</div>
          </div>
        </div>
        <span className="text-xs font-semibold text-black/40">→</span>
      </Link>
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
function AdminDashboard() {
  const { state, reload } = useAppState();
  const inventory = state.inventory.filter((i) => i.active);
  const overdueRequests = state.requests.filter((r) => r.type === "article" && r.status === "VENCIDO");
  const overdue = overdueRequests.length;
  const active  = state.requests.filter((r) => r.type === "article" && r.status === "ACTIVO").length;
  const pending = state.requests.filter((r) => r.status === "SOLICITADO").length;
  const pendingArticles = state.requests.filter((r) => r.type === "article" && r.status === "SOLICITADO");
  const roomPending = state.requests.filter((r) => r.type === "room" && r.status === "SOLICITADO").length;
  const approvedArticles = state.requests.filter((r) => r.type === "article" && r.status === "RESERVADO");
  const today = new Date().toISOString().slice(0, 10);
  const dueTodayArticles = state.requests
    .filter((r) => r.type === "article" && r.status === "ACTIVO" && r.dueDate === today)
    .sort((a, b) => (a.endTime ?? "").localeCompare(b.endTime ?? ""));
  const todayReservations = state.requests
    .filter((r) => r.type === "room" && r.startDate === today && (r.status === "SOLICITADO" || r.status === "RESERVADO"))
    .sort((a, b) => (a.startTime ?? "").localeCompare(b.startTime ?? ""))
    .slice(0, 5);

  const lowStockItems = inventory.filter(
    (i) => i.minStock > 0 && i.available <= i.minStock,
  );
  const lowStock = lowStockItems.length;

  const recent = [...state.requests]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  const recentActivity = [...state.notifications]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3);

  function activityDot(type: string) {
    switch (type) {
      case "REQUEST":   return "bg-uniclaretiana-yellow";
      case "OVERDUE":   return "bg-black/70";
      case "INVENTORY": return "bg-black/30";
      default:          return "bg-black/30";
    }
  }

  async function approveRequest(id: string, type: "article" | "room") {
    await apiFetch(
      type === "room" ? `/api/room-reservations/${id}/approve` : `/api/loans/${id}/approve`,
      { method: "PATCH" },
    );
    await reload();
  }

  async function deliverLoan(id: string) {
    await apiFetch(`/api/loans/${id}/deliver`, { method: "PATCH" });
    await reload();
  }

  async function receiveLoan(id: string) {
    await apiFetch(`/api/loans/${id}/return`, {
      method: "PATCH",
      body: JSON.stringify({ condition: "OK" }),
    });
    await reload();
  }

  return (
    <div className="space-y-12 pb-24 animate-[slide-up_0.8s_cubic-bezier(0.16,1,0.3,1)]">
      <PageHeader title="Panel de control" description="Vista general del sistema." />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="ARTÍCULOS"
          value={inventory.length}
          hint={`${lowStock} con stock bajo`}
          icon={<IconBox className="h-5 w-5" />}
        />
        <StatCard
          label="ACTIVOS"
          value={active}
          hint="Préstamos actualmente en curso"
          icon={<IconClock className="h-5 w-5" />}
        />
        <StatCard
          label="VENCIDOS"
          value={overdue}
          hint="Cuentas bloqueadas automáticamente"
          icon={<IconAlert className="h-5 w-5" />}
        />
        <StatCard
          label="SOLICITADOS"
          value={pending}
          hint={`${roomPending} reservas de salón incluidas`}
          icon={<IconInbox className="h-5 w-5" />}
        />
      </div>

      <Card title="Trabajo de hoy">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Link
            href="/app/solicitudes?type=article&status=SOLICITADO"
            className="rounded-xl border border-black/10 bg-white p-4 hover:bg-black/[0.02]"
          >
            <div className="text-xs font-semibold tracking-widest text-black/50">POR APROBAR</div>
            <div className="mt-2 text-2xl font-bold text-black">{pendingArticles.length}</div>
            <div className="mt-1 text-xs text-black/50">Solicitudes de artículos</div>
          </Link>
          <Link
            href="/app/solicitudes?type=article&status=RESERVADO"
            className="rounded-xl border border-black/10 bg-white p-4 hover:bg-black/[0.02]"
          >
            <div className="text-xs font-semibold tracking-widest text-black/50">POR ENTREGAR</div>
            <div className="mt-2 text-2xl font-bold text-black">{approvedArticles.length}</div>
            <div className="mt-1 text-xs text-black/50">Préstamos aprobados</div>
          </Link>
          <Link
            href="/app/prestamos"
            className="rounded-xl border border-black/10 bg-white p-4 hover:bg-black/[0.02]"
          >
            <div className="text-xs font-semibold tracking-widest text-black/50">POR DEVOLVER HOY</div>
            <div className="mt-2 text-2xl font-bold text-black">{dueTodayArticles.length}</div>
            <div className="mt-1 text-xs text-black/50">Artículos activos hoy</div>
          </Link>
        </div>
      </Card>

      <Card title="Acciones rápidas">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {pendingArticles.slice(0, 2).map((request) => (
            <div key={request.id} className="rounded-xl border border-black/10 p-3">
              <div className="truncate text-sm font-semibold text-black">{request.items[0]?.articleName}</div>
              <div className="mb-3 text-xs text-black/50">{request.teacherName}</div>
              <Button variant="secondary" onClick={() => { void approveRequest(request.id, request.type); }}>
                Aprobar
              </Button>
            </div>
          ))}
          {approvedArticles.slice(0, 2).map((request) => (
            <div key={request.id} className="rounded-xl border border-black/10 p-3">
              <div className="truncate text-sm font-semibold text-black">{request.items[0]?.articleName}</div>
              <div className="mb-3 text-xs text-black/50">{request.teacherName}</div>
              <Button variant="secondary" onClick={() => { void deliverLoan(request.id); }}>
                Entregar
              </Button>
            </div>
          ))}
          {dueTodayArticles.slice(0, 2).map((request) => (
            <div key={request.id} className="rounded-xl border border-black/10 p-3">
              <div className="truncate text-sm font-semibold text-black">{request.items[0]?.articleName}</div>
              <div className="mb-3 text-xs text-black/50">{request.teacherName} · {request.endTime}</div>
              <Button variant="secondary" onClick={() => { void receiveLoan(request.id); }}>
                Recibir
              </Button>
            </div>
          ))}
          {pendingArticles.length === 0 && approvedArticles.length === 0 && dueTodayArticles.length === 0 ? (
            <div className="rounded-xl border border-dashed border-black/15 p-4 text-sm text-black/50 lg:col-span-3">
              No hay acciones rápidas pendientes.
            </div>
          ) : null}
        </div>
      </Card>

      <DashboardCharts />

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <Card title="Alertas de stock bajo">
          <div className="space-y-3 text-sm">
            {lowStockItems.slice(0, 5).map((item) => (
              <Link
                key={item.id}
                href="/app/inventario"
                className="flex items-center justify-between rounded-lg border border-black/10 p-3 hover:bg-black/[0.02]"
              >
                <div className="min-w-0">
                  <div className="truncate font-semibold text-black">{item.name}</div>
                  <div className="text-xs text-black/50">{item.category}</div>
                </div>
                <span className="text-xs font-bold text-black">
                  {item.available}/{item.total}
                </span>
              </Link>
            ))}
            {lowStockItems.length === 0 ? (
              <div className="rounded-lg border border-dashed border-black/15 p-3 text-center text-black/50">
                Todo el inventario está por encima del mínimo.
              </div>
            ) : null}
          </div>
        </Card>

        <Card title="Reservas de hoy">
          <div className="space-y-3 text-sm">
            {todayReservations.map((r) => (
              <Link
                key={r.id}
                href="/app/solicitudes"
                className="flex items-start justify-between gap-3 rounded-lg border border-black/10 p-3 hover:bg-black/[0.02]"
              >
                <div className="min-w-0">
                  <div className="truncate font-semibold text-black">{r.items[0]?.articleName}</div>
                  <div className="text-xs text-black/50">{r.teacherName}</div>
                </div>
                <span className="text-xs font-semibold text-black/60">{r.startTime}-{r.endTime}</span>
              </Link>
            ))}
            {todayReservations.length === 0 ? (
              <div className="rounded-lg border border-dashed border-black/15 p-3 text-center text-black/50">
                No hay reservas para hoy.
              </div>
            ) : null}
          </div>
        </Card>

        <Card title="Préstamos vencidos">
          <div className="space-y-3 text-sm">
            {overdueRequests.slice(0, 5).map((r) => (
              <Link
                key={r.id}
                href="/app/prestamos"
                className="flex items-start justify-between gap-3 rounded-lg border border-black/10 p-3 hover:bg-black/[0.02]"
              >
                <div className="min-w-0">
                  <div className="truncate font-semibold text-black">{r.teacherName}</div>
                  <div className="truncate text-xs text-black/50">{r.items[0]?.articleName}</div>
                </div>
                <Badge variant="overdue">Vencido</Badge>
              </Link>
            ))}
            {overdueRequests.length === 0 ? (
              <div className="rounded-lg border border-dashed border-black/15 p-3 text-center text-black/50">
                No hay préstamos vencidos.
              </div>
            ) : null}
          </div>
        </Card>

        <Card title="Devoluciones de hoy">
          <div className="space-y-3 text-sm">
            {dueTodayArticles.slice(0, 5).map((r) => (
              <Link
                key={r.id}
                href="/app/prestamos"
                className="flex items-start justify-between gap-3 rounded-lg border border-black/10 p-3 hover:bg-black/[0.02]"
              >
                <div className="min-w-0">
                  <div className="truncate font-semibold text-black">{r.teacherName}</div>
                  <div className="truncate text-xs text-black/50">{r.items[0]?.articleName}</div>
                </div>
                <span className="text-xs font-semibold text-black/60">{r.endTime ?? "Hoy"}</span>
              </Link>
            ))}
            {dueTodayArticles.length === 0 ? (
              <div className="rounded-lg border border-dashed border-black/15 p-3 text-center text-black/50">
                No hay devoluciones programadas para hoy.
              </div>
            ) : null}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card title="Solicitudes recientes">
          <div className="space-y-3 text-sm">
            {recent.map((r) => (
              <div
                key={r.id}
                className="flex items-start justify-between gap-4 rounded-lg border border-black/10 p-3"
              >
                <div>
                  <div className="font-semibold text-black">{r.teacherName}</div>
                  <div className="text-black/60">
                    {r.type === "room" ? "Salón" : "Artículo"} · {r.items[0]?.articleName}
                  </div>
                  <div className="mt-1 text-xs font-semibold tracking-widest text-black/50">
                    {r.program}
                  </div>
                </div>
                <Badge variant={requestStatusToBadgeVariant(r.status)}>
                  {requestStatusLabel(r.status)}
                </Badge>
              </div>
            ))}
            {recent.length === 0 ? (
              <div className="rounded-lg border border-dashed border-black/15 p-3 text-center text-black/50">
                Sin solicitudes recientes.
              </div>
            ) : null}
          </div>
        </Card>

        <Card title="Actividad reciente">
          <div className="space-y-3 text-sm text-black/70">
            {recentActivity.map((n) => (
              <div
                key={n.id}
                className="flex items-start gap-3 rounded-lg border border-black/10 p-3"
              >
                <span className={`mt-0.5 h-2 w-2 rounded-full ${activityDot(n.type)}`} />
                <div className="min-w-0">
                  <div className="truncate font-semibold text-black">{n.title}</div>
                  <div className="truncate">{n.message}</div>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 ? (
              <div className="rounded-lg border border-black/10 p-3">Sin actividad reciente.</div>
            ) : null}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── Page entry point ────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { state } = useAppState();
  return state.role === "teacher" ? <TeacherDashboard /> : <AdminDashboard />;
}
