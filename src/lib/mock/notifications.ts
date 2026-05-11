export type NotificationType =
  | "OVERDUE"
  | "REQUEST"
  | "INVENTORY"
  | "SYSTEM";

export type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
};

export const notificationsMock: Notification[] = [
  {
    id: "n1",
    type: "OVERDUE",
    title: "Préstamo vencido",
    message: "Se detectó un préstamo vencido. La cuenta del docente queda bloqueada.",
    createdAt: "2026-03-24T08:00:00.000Z",
    read: false,
  },
  {
    id: "n2",
    type: "REQUEST",
    title: "Solicitud recibida",
    message: "Se recibió una nueva solicitud de préstamo SOLICITADO de aprobación.",
    createdAt: "2026-03-24T09:10:00.000Z",
    read: true,
  },
  {
    id: "n3",
    type: "INVENTORY",
    title: "Stock bajo",
    message: "Hay artículos con disponibilidad crítica. Revisa el inventario.",
    createdAt: "2026-03-23T11:10:00.000Z",
    read: true,
  },
];
