"use client";

import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { useAppState } from "@/state/app-state";

export function DashboardCharts() {
  const { state } = useAppState();

  const categoryData = useMemo(() => {
    const counts: Record<string, number> = {};
    state.inventory.forEach((item) => {
      if (item.active) {
        counts[item.category] = (counts[item.category] || 0) + item.total;
      }
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [state.inventory]);

  const statusData = useMemo(() => {
    const counts: Record<string, number> = {
      SOLICITADO: 0,
      RESERVADO: 0,
      ACTIVO: 0,
      DEVUELTO: 0,
      VENCIDO: 0,
      RECHAZADA: 0,
      CANCELADO: 0,
    };
    state.requests.forEach((req) => {
      if (counts[req.status] !== undefined) {
        counts[req.status]++;
      }
    });

    const labelMap: Record<string, string> = {
      SOLICITADO: "Solicitados",
      RESERVADO: "Reservados",
      ACTIVO: "Activos",
      DEVUELTO: "Devueltos",
      VENCIDO: "Vencidos",
      RECHAZADA: "Rechazados",
      CANCELADO: "Cancelados",
    };

    return Object.entries(counts)
      .filter((entry) => entry[1] > 0)
      .map(([key, value]) => ({
        name: labelMap[key] || key,
        count: value,
      }));
  }, [state.requests]);

  const COLORS = ["#FACC15", "#1F2937", "#6B7280", "#9CA3AF", "#D1D5DB", "#F3F4F6"];
  const STATUS_COLORS = {
    Solicitados: "#FBBF24",
    Reservados: "#3B82F6",
    Activos: "#10B981",
    Devueltos: "#6B7280",
    Vencidos: "#EF4444",
    Rechazados: "#F87171",
    Cancelados: "#9CA3AF",
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Gráfico de Categorías */}
      <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-bold tracking-widest text-black/70">
          DISTRIBUCIÓN DE INVENTARIO
        </h3>
        <div className="h-64 w-full">
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  itemStyle={{ color: "#000", fontWeight: "bold" }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-black/40">
              No hay datos suficientes
            </div>
          )}
        </div>
      </div>

      {/* Gráfico de Estados de Préstamos */}
      <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-bold tracking-widest text-black/70">
          ESTADO DE PRÉSTAMOS
        </h3>
        <div className="h-64 w-full">
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: "#6B7280" }}
                  allowDecimals={false}
                />
                <Tooltip
                  cursor={{ fill: "#F3F4F6" }}
                  contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  formatter={(value) => [value, "Cantidad"]}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || "#1F2937"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-black/40">
              No hay datos suficientes
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
