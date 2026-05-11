export type UserRole = "student" | "teacher" | "admin";

export type User = {
  id: string;
  name: string;
  program: string;
  email: string;
  role: UserRole;
  blocked: boolean;
};

export type LoanRequestStatus =
  | "SOLICITADO"
  | "RESERVADO"
  | "RECHAZADA"
  | "ACTIVO"
  | "DEVUELTO"
  | "VENCIDO"
  | "CANCELADO";

export type LoanRequestItem = {
  articleId: string;
  articleName: string;
  quantity: number;
};

export type LoanRequest = {
  id: string;
  type: "article" | "room";
  teacherId: string;
  teacherName: string;
  program: string;
  items: LoanRequestItem[];
  startDate: string;
  dueDate: string;
  status: LoanRequestStatus;
  adminNote?: string;
  createdAt: string;
};

export const usersMock: User[] = [
  {
    id: "u1",
    name: "Carlos Ramírez",
    program: "Facultad de Ingeniería",
    email: "camila.torres@uniclaretiana.edu.co",
    role: "teacher",
    blocked: false,
  },
  {
    id: "u2",
    name: "María Fernanda Ruiz",
    program: "Facultad de Ciencias",
    email: "andres.mora@uniclaretiana.edu.co",
    role: "teacher",
    blocked: false,
  },
  {
    id: "u3",
    name: "Laura Gómez",
    program: "Ingeniería de Sistemas",
    email: "sara.jimenez@uniclaretiana.edu.co",
    role: "student",
    blocked: true,
  },
];

export const requestsMock: LoanRequest[] = [
  {
    id: "r1",
    type: "article",
    teacherId: "u1",
    teacherName: "Carlos Ramírez",
    program: "Facultad de Ingeniería",
    items: [{ articleId: "portatil", articleName: "Portátil", quantity: 1 }],
    startDate: "2026-03-24",
    dueDate: "2026-03-28",
    status: "SOLICITADO",
    createdAt: "2026-03-24T09:10:00.000Z",
  },
  {
    id: "r2",
    type: "article",
    teacherId: "u2",
    teacherName: "María Fernanda Ruiz",
    program: "Facultad de Ciencias",
    items: [{ articleId: "hdmi", articleName: "Cable HDMI", quantity: 2 }],
    startDate: "2026-03-23",
    dueDate: "2026-03-30",
    status: "ACTIVO",
    createdAt: "2026-03-23T14:32:00.000Z",
  },
  {
    id: "r3",
    type: "article",
    teacherId: "u2",
    teacherName: "María Fernanda Ruiz",
    program: "Facultad de Ciencias",
    items: [{ articleId: "monitor", articleName: "Monitor LG 27\"", quantity: 1 }],
    startDate: "2026-03-15",
    dueDate: "2026-03-20",
    status: "VENCIDO",
    adminNote: "SOLICITADO de devolución.",
    createdAt: "2026-03-15T10:00:00.000Z",
  },
  {
    id: "r4",
    type: "article",
    teacherId: "u1",
    teacherName: "Carlos Ramírez",
    program: "Facultad de Ingeniería",
    items: [{ articleId: "extension", articleName: "Extensión eléctrica", quantity: 1 }],
    startDate: "2026-03-18",
    dueDate: "2026-03-21",
    status: "DEVUELTO",
    createdAt: "2026-03-18T11:10:00.000Z",
  },
  {
    id: "r5",
    type: "article",
    teacherId: "u2",
    teacherName: "María Fernanda Ruiz",
    program: "Facultad de Ciencias",
    items: [{ articleId: "teclado", articleName: "Teclado", quantity: 1 }],
    startDate: "2026-03-22",
    dueDate: "2026-03-25",
    status: "RECHAZADA",
    adminNote: "No hay disponibilidad para la fecha solicitada.",
    createdAt: "2026-03-22T08:40:00.000Z",
  },
  {
    id: "r6",
    type: "article",
    teacherId: "u1",
    teacherName: "Carlos Ramírez",
    program: "Facultad de Ingeniería",
    items: [{ articleId: "mouse", articleName: "Mouse", quantity: 1 }],
    startDate: "2026-03-24",
    dueDate: "2026-03-26",
    status: "CANCELADO",
    createdAt: "2026-03-24T07:50:00.000Z",
  },
];
