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
  | "EN_DEVOLUCION"
  | "DEVUELTO"
  | "VENCIDO"
  | "CANCELADO";

export type LoanRequestItem = {
  articleId: string;
  articleName: string;
  articleSerial?: string;
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
  startTime?: string;
  endTime?: string;
  status: LoanRequestStatus;
  adminNote?: string;
  returnCondition?: "OK" | "ISSUE";
  returnNote?: string;
  createdAt: string;
};
