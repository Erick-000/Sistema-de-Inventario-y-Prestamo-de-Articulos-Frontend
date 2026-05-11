import type { LoanRequest } from "@/lib/types/requests";

export type TopItem = { name: string; count: number };
export type TopStudent = { name: string; count: number };

export function getTopItems(requests: LoanRequest[]): TopItem[] {
  const map = new Map<string, number>();
  for (const req of requests.filter((request) => request.type === "article")) {
    for (const it of req.items) {
      map.set(it.articleName, (map.get(it.articleName) ?? 0) + it.quantity);
    }
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

export function getTopStudents(requests: LoanRequest[]): TopStudent[] {
  const map = new Map<string, number>();
  for (const req of requests) {
    map.set(req.teacherName, (map.get(req.teacherName) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

export function getLateReturnsSummary(requests: LoanRequest[]) {
  const articleRequests = requests.filter((request) => request.type === "article");
  const overdue = articleRequests.filter((r) => r.status === "VENCIDO").length;
  const returned = articleRequests.filter((r) => r.status === "DEVUELTO").length;
  const active = articleRequests.filter((r) => r.status === "ACTIVO").length;
  return { overdue, returned, active };
}
