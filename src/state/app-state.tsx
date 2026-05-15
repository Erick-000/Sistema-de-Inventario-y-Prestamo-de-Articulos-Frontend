"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useReducer } from "react";
import type { LoanRequest, User } from "@/lib/types/requests";
import type { Notification } from "@/lib/types/notifications";
import type { InventoryItem } from "@/lib/types/inventory";
import { apiFetch } from "@/lib/api/client";
import { getToken, getUser, setSession } from "@/lib/auth/session";

type ArticleDto = {
  _id: string;
  nombre: string;
  serial?: string | null;
  categoria: InventoryItem["category"];
  ubicacion?: string | null;
  responsable?: string | null;
  notas?: string | null;
  estadoObjeto?: InventoryItem["objectStatus"];
  stockTotal: number;
  stockDisponible: number;
  stockMinimo?: number;
  activo: boolean;
};

type LoanItemDto = {
  articuloId: string;
  nombreArticulo: string;
  serialArticulo?: string | null;
  cantidad: number;
};

type LoanDto = {
  _id: string;
  docenteId: string;
  nombreDocente: string;
  programa?: string | null;
  items: LoanItemDto[];
  fechaInicio: string;
  fechaLimite: string;
  startMin?: number;
  endMin?: number;
  estado: LoanRequest["status"];
  notaAdmin?: string | null;
  returnCondition?: "OK" | "ISSUE" | null;
  returnNote?: string | null;
  actaFirma?: {
    dataUrl: string;
    signerName: string;
    signerId?: string | null;
    signedAt: string;
  } | null;
  createdAt?: string;
};

type RoomReservationDto = {
  _id: string;
  salonId: string;
  nombreSalon: string;
  docenteId: string;
  nombreDocente: string;
  fecha: string;
  startMin: number;
  endMin: number;
  nota?: string | null;
  estado: LoanRequest["status"] | "CANCELADA";
  createdAt?: string;
};

type NotificationDto = {
  _id: string;
  tipo: Notification["type"];
  titulo: string;
  mensaje: string;
  createdAt?: string;
  leida: boolean;
};

type TeacherDto = {
  _id: string;
  nombreCompleto: string;
  programa?: string | null;
  correo: string;
  bloqueado: boolean;
};

export type AppRole = "admin" | "teacher" | "student";

export type AppState = {
  role: AppRole;
  users: User[];
  requests: LoanRequest[];
  notifications: Notification[];
  inventory: InventoryItem[];
};

type Action =
  | { type: "SET_ROLE"; role: AppRole }
  | {
      type: "SET_DATA";
      users: User[];
      requests: LoanRequest[];
      notifications: Notification[];
      inventory: InventoryItem[];
    }
  | { type: "APPROVE_REQUEST"; requestId: string }
  | { type: "REJECT_REQUEST"; requestId: string; note: string }
  | { type: "MARK_RETURNED"; requestId: string }
  | { type: "MARK_NOTIFICATION_READ"; notificationId: string }
  | { type: "MARK_ALL_NOTIFICATIONS_READ" }
  | { type: "INVENTORY_CREATE"; item: InventoryItem }
  | { type: "INVENTORY_UPDATE"; itemId: string; patch: Partial<InventoryItem> }
  | { type: "INVENTORY_ADJUST"; itemId: string; total: number; available: number }
  | { type: "INVENTORY_DEACTIVATE"; itemId: string };

function newId(prefix: string) {
  return `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now().toString(16)}`;
}

function minutesToTime(value: number) {
  const minutes = Math.max(0, Math.floor(Number(value)));
  const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
  const mm = String(minutes % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

function normalizeInventoryCategory(value: unknown) {
  const category = String(value ?? "").trim();
  if (!category || category === "Hardware") return "Equipos de cómputo";
  if (category === "Eléctrica") return "Energía";
  return category;
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_ROLE":
      return { ...state, role: action.role };

    case "SET_DATA":
      return {
        ...state,
        users: action.users,
        requests: action.requests,
        notifications: action.notifications,
        inventory: action.inventory,
      };

    case "APPROVE_REQUEST": {
      const requests = state.requests.map((r) => {
        if (r.id !== action.requestId) return r;
        if (r.status !== "SOLICITADO") return r;
        return { ...r, status: "RESERVADO" as const, adminNote: undefined };
      });
      const notifications: Notification[] = [
        {
          id: newId("n"),
          type: "REQUEST",
          title: "Solicitud RESERVADO",
          message: "Una solicitud fue RESERVADO y el préstamo quedó activo.",
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...state.notifications,
      ];
      return { ...state, requests, notifications };
    }

    case "REJECT_REQUEST": {
      const requests = state.requests.map((r) => {
        if (r.id !== action.requestId) return r;
        if (r.status !== "SOLICITADO") return r;
        return { ...r, status: "RECHAZADA" as const, adminNote: action.note };
      });
      const notifications: Notification[] = [
        {
          id: newId("n"),
          type: "REQUEST",
          title: "Solicitud rechazada",
          message: "Una solicitud fue rechazada. El motivo quedó registrado.",
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...state.notifications,
      ];
      return { ...state, requests, notifications };
    }

    case "MARK_RETURNED": {
      const target = state.requests.find((r) => r.id === action.requestId);
      if (!target) return state;

      const requests = state.requests.map((r) => {
        if (r.id !== action.requestId) return r;
        if (r.status !== "ACTIVO" && r.status !== "VENCIDO") return r;
        return { ...r, status: "DEVUELTO" as const };
      });

      const users = state.users.map((u) => {
        if (u.id !== target.teacherId) return u;
        return { ...u, blocked: false };
      });

      const notifications: Notification[] = [
        {
          id: newId("n"),
          type: "SYSTEM",
          title: "Devolución registrada",
          message: "Se registró una devolución y el préstamo se cerró.",
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...state.notifications,
      ];

      return { ...state, requests, users, notifications };
    }

    case "MARK_NOTIFICATION_READ": {
      const notifications = state.notifications.map((n) =>
        n.id === action.notificationId ? { ...n, read: true } : n,
      );
      return { ...state, notifications };
    }

    case "MARK_ALL_NOTIFICATIONS_READ": {
      const notifications = state.notifications.map((n) => ({ ...n, read: true }));
      return { ...state, notifications };
    }

    case "INVENTORY_CREATE": {
      const inventory = [action.item, ...state.inventory];
      return { ...state, inventory };
    }

    case "INVENTORY_UPDATE": {
      const inventory = state.inventory.map((it) =>
        it.id === action.itemId ? { ...it, ...action.patch } : it,
      );
      return { ...state, inventory };
    }

    case "INVENTORY_ADJUST": {
      const inventory = state.inventory.map((it) => {
        if (it.id !== action.itemId) return it;
        const total = Math.max(0, Math.floor(action.total));
        const available = Math.max(0, Math.min(total, Math.floor(action.available)));
        return { ...it, total, available };
      });
      return { ...state, inventory };
    }

    case "INVENTORY_DEACTIVATE": {
      const inventory = state.inventory.map((it) =>
        it.id === action.itemId ? { ...it, active: false } : it,
      );
      return { ...state, inventory };
    }

    default:
      return state;
  }
}

const Ctx = createContext<
  | {
      state: AppState;
      dispatch: (action: Action) => void;
      reload: () => Promise<void>;
    }
  | undefined
>(undefined);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const initialRole: AppRole = (() => {
    const r = getUser()?.role;
    return r === "admin" ? "admin" : (r === "teacher" || r === "docente") ? "teacher" : "student";
  })();

  const [state, dispatch] = useReducer(reducer, {
    role: initialRole,
    users: [],
    requests: [],
    notifications: [],
    inventory: [],
  });

  async function syncMe() {
    const token = getToken();
    if (!token) return;
    const res = await apiFetch<{ user: { id: string; role: string; name?: string; email?: string; blocked?: boolean } }>(
      "/api/auth/me",
    );
    const u = res.user;
    if (!u || !u.id || !u.role) return;
    setSession(token, {
      id: String(u.id),
      role: String(u.role),
      name: String(u.name ?? ""),
      email: String(u.email ?? ""),
      blocked: Boolean(u.blocked),
    });
  }

  async function reload() {
    const sessionUser = getUser();

    const role = sessionUser?.role;
    const loansPromise =
      role === "admin"
        ? apiFetch<LoanDto[]>("/api/loans")
        : (role === "teacher" || role === "docente")
          ? apiFetch<LoanDto[]>("/api/loans/mine")
          : Promise.resolve<LoanDto[]>([]);
    const roomReservationsPromise =
      role === "admin"
        ? apiFetch<RoomReservationDto[]>("/api/room-reservations")
        : (role === "teacher" || role === "docente")
          ? apiFetch<RoomReservationDto[]>("/api/room-reservations/mine")
          : Promise.resolve<RoomReservationDto[]>([]);

    const [articles, loans, roomReservations, notifications, teachers] = await Promise.all([
      apiFetch<ArticleDto[]>("/api/articles"),
      loansPromise,
      roomReservationsPromise.catch(() => []),
      apiFetch<NotificationDto[]>(`/api/notifications${sessionUser?.id ? `?userId=${sessionUser.id}` : ""}`),
      role === "admin" ? apiFetch<TeacherDto[]>("/api/users/teachers") : Promise.resolve([]),
    ]);

    const users: User[] = teachers.map((t) => ({
      id: String(t._id),
      name: t.nombreCompleto,
      program: t.programa ?? "",
      email: t.correo,
      role: "teacher",
      blocked: Boolean(t.bloqueado),
    }));

    const inventory: InventoryItem[] = articles.map((a) => ({
      id: String(a._id),
      name: a.nombre,
      serial: a.serial ? String(a.serial) : undefined,
      category: normalizeInventoryCategory(a.categoria),
      location: a.ubicacion ?? undefined,
      responsible: a.responsable ?? undefined,
      notes: a.notas ?? undefined,
      objectStatus: a.estadoObjeto ?? "OPERATIVO",
      total: a.stockTotal,
      available: a.stockDisponible,
      minStock: Math.max(0, Math.floor(Number(a.stockMinimo ?? 0))),
      active: Boolean(a.activo),
    }));

    const requests: LoanRequest[] = loans.map((l) => ({
      id: String(l._id),
      type: "article",
      teacherId: String(l.docenteId),
      teacherName: l.nombreDocente,
      program: l.programa ?? "",
      items: (l.items ?? []).map((it) => ({
        articleId: String(it.articuloId),
        articleName: it.nombreArticulo,
        articleSerial: it.serialArticulo ? String(it.serialArticulo) : undefined,
        quantity: it.cantidad,
      })),
      startDate: new Date(l.fechaInicio).toISOString().slice(0, 10),
      dueDate: new Date(l.fechaLimite).toISOString().slice(0, 10),
      startTime: typeof l.startMin === "number" ? minutesToTime(l.startMin) : undefined,
      endTime: typeof l.endMin === "number" ? minutesToTime(l.endMin) : undefined,
      status: l.estado,
      adminNote: l.notaAdmin ?? undefined,
      returnCondition: l.returnCondition ?? undefined,
      returnNote: l.returnNote ?? undefined,
      actSignature: l.actaFirma
        ? {
            dataUrl: l.actaFirma.dataUrl,
            signerName: l.actaFirma.signerName,
            signerId: l.actaFirma.signerId ?? undefined,
            signedAt: l.actaFirma.signedAt,
          }
        : undefined,
      createdAt: l.createdAt ?? new Date().toISOString(),
    }));

    const roomRequests: LoanRequest[] = roomReservations.map((r) => ({
      id: String(r._id),
      type: "room",
      teacherId: String(r.docenteId),
      teacherName: r.nombreDocente,
      program: "",
      items: [
        {
          articleId: String(r.salonId),
          articleName: r.nombreSalon,
          articleSerial: `${minutesToTime(r.startMin)} - ${minutesToTime(r.endMin)}`,
          quantity: 1,
        },
      ],
      startDate: r.fecha,
      dueDate: r.fecha,
      startTime: minutesToTime(r.startMin),
      endTime: minutesToTime(r.endMin),
      status: r.estado === "CANCELADA" ? "CANCELADO" : r.estado,
      adminNote: r.nota ?? undefined,
      createdAt: r.createdAt ?? new Date().toISOString(),
    }));

    const mappedNotifications: Notification[] = notifications.map((n) => ({
      id: String(n._id),
      type: n.tipo,
      title: n.titulo,
      message: n.mensaje,
      createdAt: n.createdAt ?? new Date().toISOString(),
      read: Boolean(n.leida),
    }));

    dispatch({
      type: "SET_DATA",
      users,
      requests: [...requests, ...roomRequests].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      notifications: mappedNotifications,
      inventory,
    });
  }

  useEffect(() => {
    syncMe()
      .catch(() => {})
      .finally(() => {
        const user = getUser();
        dispatch({
          type: "SET_ROLE",
          role:
            user?.role === "admin" ? "admin" : (user?.role === "teacher" || user?.role === "docente") ? "teacher" : "student",
        });
        reload().catch(() => {});
      });
  }, []);

  const value = useMemo(() => ({ state, dispatch, reload }), [state]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
