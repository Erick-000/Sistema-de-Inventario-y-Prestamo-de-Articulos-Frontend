"use client";

import { Card } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/Button";
import { getLateReturnsSummary, getTopItems, getTopStudents } from "@/lib/reports";
import { useAppState } from "@/state/app-state";
import { IconDownload } from "@/components/Icons";
import { ReportesChart } from "@/components/ReportesChart";
import * as XLSX from "xlsx";

export default function ReportesPage() {
  const { state } = useAppState();
  const topItems = getTopItems(state.requests);
  const topStudents = getTopStudents(state.requests);
  const summary = getLateReturnsSummary(state.requests);
  const articleRequests = state.requests.filter((request) => request.type === "article");
  const roomRequests = state.requests.filter((request) => request.type === "room");
  const pending = state.requests.filter((request) => request.status === "SOLICITADO").length;
  const approvedRooms = roomRequests.filter((request) => request.status === "RESERVADO").length;

  const downloadWorkbook = () => {
    const workbook = XLSX.utils.book_new();
    const requestRows = state.requests.map((request) => ({
      ID: request.id,
      Tipo: request.type === "room" ? "Salón" : "Artículo",
      Docente: request.teacherName,
      Programa: request.program,
      Solicitud: request.items.map((item) => item.articleName).join(", "),
      Estado: request.status,
      Inicio: request.startDate,
      Límite: request.dueDate,
      "Hora inicio": request.startTime ?? "",
      "Hora fin": request.endTime ?? "",
      Nota: request.adminNote ?? "",
      Creado: request.createdAt,
    }));
    const inventoryRows = state.inventory.map((item) => ({
      ID: item.id,
      Nombre: item.name,
      Serial: item.serial ?? "",
      Categoría: item.category,
      Estado: item.objectStatus,
      Total: item.total,
      Disponible: item.available,
      "Stock mínimo": item.minStock,
      Activo: item.active ? "Sí" : "No",
    }));
    const summaryRows = [
      { Indicador: "Solicitudes pendientes", Valor: pending },
      { Indicador: "Préstamos activos", Valor: summary.active },
      { Indicador: "Préstamos vencidos", Valor: summary.overdue },
      { Indicador: "Préstamos devueltos", Valor: summary.returned },
      { Indicador: "Reservas aprobadas", Valor: approvedRooms },
      { Indicador: "Artículos registrados", Valor: state.inventory.length },
    ];

    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(summaryRows), "Resumen");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(requestRows), "Solicitudes");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(inventoryRows), "Inventario");
    XLSX.writeFile(workbook, `reporte_sistema_${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportes"
        description="Indicadores exportables de préstamos, reservas e inventario."
        right={
          <Button variant="secondary" onClick={downloadWorkbook} leftIcon={<IconDownload className="h-5 w-5" />}>
            Exportar Excel
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="PENDIENTES" value={pending} hint="Artículos y salones por revisar" />
        <StatCard label="VENCIDOS" value={summary.overdue} hint="Préstamos vencidos" />
        <StatCard label="ACTIVOS" value={summary.active} hint="Préstamos en curso" />
        <StatCard label="DEVUELTOS" value={summary.returned} hint="Préstamos cerrados" />
        <StatCard label="RESERVAS" value={approvedRooms} hint={`${roomRequests.length} solicitudes de salón`} />
      </div>

      <ReportesChart />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Artículos más solicitados">
          <div className="space-y-3">
            {topItems.map((it) => (
              <div
                key={it.name}
                className="flex items-center justify-between rounded-lg border border-black/10 p-3"
              >
                <div className="text-sm font-semibold text-black">{it.name}</div>
                <div className="rounded-full bg-uniclaretiana-yellow px-3 py-1 text-xs font-semibold text-uniclaretiana-black">
                  {it.count}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Resumen por tipo">
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-black/10 p-3">
              <div>
                <div className="text-sm font-semibold text-black">Solicitudes de artículos</div>
                <div className="text-xs text-black/50">Préstamos y devoluciones</div>
              </div>
              <div className="rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
                {articleRequests.length}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-black/10 p-3">
              <div>
                <div className="text-sm font-semibold text-black">Reservas de salones</div>
                <div className="text-xs text-black/50">Solicitudes y aprobaciones</div>
              </div>
              <div className="rounded-full bg-uniclaretiana-yellow px-3 py-1 text-xs font-semibold text-uniclaretiana-black">
                {roomRequests.length}
              </div>
            </div>
          </div>
        </Card>

        <Card title="Docentes con más solicitudes">
          <div className="space-y-3">
            {topStudents.map((s) => (
              <div
                key={s.name}
                className="flex items-center justify-between rounded-lg border border-black/10 p-3"
              >
                <div className="text-sm font-semibold text-black">{s.name}</div>
                <div className="rounded-full bg-black/[0.04] px-3 py-1 text-xs font-semibold text-black">
                  {s.count}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
