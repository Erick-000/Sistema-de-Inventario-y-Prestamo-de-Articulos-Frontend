"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAppState } from "@/state/app-state";

function toISODate(value: string) {
  return value.split("T")[0] ?? value;
}

function addDaysISO(dateISO: string, days: number) {
  const date = new Date(`${dateISO}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function formatShortISO(dateISO: string) {
  const parts = dateISO.split("-");
  if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
  return dateISO;
}

export function ReportesChart() {
  const { state } = useAppState();

  const data = useMemo(() => {
    const sorted = [...state.requests].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    if (sorted.length === 0) return [] as Array<{ date: string; fullDate: string; total: number; article: number; room: number }>;

    const last = toISODate(sorted[sorted.length - 1].createdAt);
    const daysWindow = 14;
    const start = addDaysISO(last, -1 * (daysWindow - 1));

    const grouped: Record<string, { total: number; article: number; room: number }> = {};
    for (let d = 0; d < daysWindow; d++) {
      const key = addDaysISO(start, d);
      grouped[key] = { total: 0, article: 0, room: 0 };
    }

    for (const req of sorted) {
      const day = toISODate(req.createdAt);
      if (!(day in grouped)) continue;
      grouped[day].total += 1;
      if (req.type === "article") grouped[day].article += 1;
      if (req.type === "room") grouped[day].room += 1;
    }

    return Object.keys(grouped)
      .sort((a, b) => a.localeCompare(b))
      .map((fullDate) => ({
        fullDate,
        date: formatShortISO(fullDate),
        total: grouped[fullDate].total,
        article: grouped[fullDate].article,
        room: grouped[fullDate].room,
      }));
  }, [state.requests]);

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-bold tracking-widest text-black/70">
        EVOLUCIÓN DE PRÉSTAMOS
      </h3>
      <div className="h-72 w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FACC15" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#FACC15" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6B7280" }}
                dy={10}
                interval="preserveStartEnd"
              />
              <YAxis 
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#6B7280" }}
              />
              <Tooltip
                cursor={{ stroke: "#9CA3AF", strokeWidth: 1, strokeDasharray: "3 3" }}
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                labelStyle={{ fontWeight: "bold", color: "#1F2937", marginBottom: "4px" }}
                formatter={(value, name) => {
                  const n = typeof value === "number" ? value : Number(value);
                  const key = String(name);
                  const label =
                    key === "total"
                      ? "Total"
                      : key === "article"
                        ? "Artículos"
                        : key === "room"
                          ? "Salones"
                          : key;
                  return [Number.isFinite(n) ? n : String(value), label];
                }}
                labelFormatter={(label: unknown) => String(label)}
              />
              <Area
                type="monotone"
                dataKey="total"
                name="total"
                stroke="#EAB308"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorTotal)"
              />
              <Line
                type="monotone"
                dataKey="article"
                name="article"
                stroke="#111827"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="room"
                name="room"
                stroke="#10B981"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-black/40">
            No hay datos suficientes
          </div>
        )}
      </div>
    </div>
  );
}
