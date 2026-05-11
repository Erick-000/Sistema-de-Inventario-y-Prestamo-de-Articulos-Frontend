import type { BadgeVariant } from "@/components/Badge";
import type { LoanRequestStatus } from "@/lib/types/requests";

export function requestStatusToBadgeVariant(status: LoanRequestStatus): BadgeVariant {
  switch (status) {
    case "SOLICITADO":
      return "pending";
    case "RESERVADO":
      return "approved";
    case "RECHAZADA":
      return "rejected";
    case "ACTIVO":
      return "active";
    case "EN_DEVOLUCION":
      return "returning";
    case "DEVUELTO":
      return "returned";
    case "VENCIDO":
      return "overdue";
    case "CANCELADO":
      return "cancelled";
  }
}

export function requestStatusLabel(status: LoanRequestStatus) {
  switch (status) {
    case "SOLICITADO":
      return "Solicitado";
    case "RESERVADO":
      return "Reservado";
    case "RECHAZADA":
      return "Rechazada";
    case "ACTIVO":
      return "Activo";
    case "EN_DEVOLUCION":
      return "En devolución";
    case "DEVUELTO":
      return "Devuelto";
    case "VENCIDO":
      return "Vencido";
    case "CANCELADO":
      return "Cancelado";
  }
}
