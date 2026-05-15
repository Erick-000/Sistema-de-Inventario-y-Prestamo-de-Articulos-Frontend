import { InventoryItem } from "@/lib/types/inventory";
import {
  IconCable,
  IconElectric,
  IconHardware,
  IconPeripherals,
  IconRemote,
  IconTools,
} from "@/components/Icons";

function clampPercent(value: number) {
  if (Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

export function InventoryCard({
  item,
  onSolicitar,
  actions,
}: {
  item: InventoryItem;
  onSolicitar?: () => void;
  actions?: React.ReactNode;
}) {
  const loaned = item.total - item.available;
  const percent = item.total === 0 ? 0 : clampPercent((item.available / item.total) * 100);

  const CategoryIcon =
    item.category === "Hardware" || item.category === "Equipos de cómputo"
      ? IconHardware
      : item.category === "Periféricos" || item.category === "Audiovisuales"
        ? IconPeripherals
        : item.category === "Cables" || item.category === "Conectividad"
          ? IconCable
          : item.category === "Eléctrica" || item.category === "Energía"
            ? IconElectric
            : item.category === "Herramientas"
              ? IconTools
              : IconRemote;

  const level =
    item.minStock > 0 && item.available <= item.minStock
      ? "critical"
      : percent <= 20
        ? "critical"
        : percent <= 45
          ? "low"
          : "ok";

  const barColor =
    level === "critical"
      ? "bg-black"
      : level === "low"
        ? "bg-uniclaretiana-yellow"
        : "bg-black/70";

  return (
    <div className="group rounded-2xl border border-black/5 bg-black/[0.02] p-1 shadow-sm transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:bg-black/[0.04] hover:shadow-md sm:rounded-[2rem] sm:p-1.5">
      <div className="flex h-full flex-col rounded-[calc(1rem-0.25rem)] bg-white p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] ring-1 ring-black/5 sm:rounded-[calc(2rem-0.375rem)] sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.25rem] border border-black/5 bg-[radial-gradient(14px_14px_at_30%_30%,rgba(244,196,0,0.22),transparent_60%)] text-black/80 shadow-sm transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110">
              <CategoryIcon className="h-6 w-6" />
            </span>
            <div className="min-w-0">
              <div className="text-sm font-bold leading-tight text-black line-clamp-2">{item.name}</div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">
                {item.category}
              </div>
            </div>
          </div>
          <span className="w-fit max-w-full shrink-0 truncate rounded-full bg-black/[0.04] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-black/60 shadow-sm ring-1 ring-inset ring-black/5">
            {item.serial || `UIB-${item.id.slice(-6).toUpperCase()}`}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-x-4 gap-y-3 rounded-[1.25rem] border border-black/5 bg-black/[0.015] p-4 text-xs shadow-inner sm:mt-6 sm:grid-cols-2">
          {item.serial && (
            <div className="flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-widest text-black/40">Serial</span>
              <span className="font-semibold text-black/80 truncate">{item.serial}</span>
            </div>
          )}
          {item.location && (
            <div className="flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-widest text-black/40">Ubicación</span>
              <span className="font-semibold text-black/80 truncate">{item.location}</span>
            </div>
          )}
          {item.responsible && (
            <div className="flex flex-col">
              <span className="text-[9px] font-bold uppercase tracking-widest text-black/40">Responsable</span>
              <span className="font-semibold text-black/80 truncate">{item.responsible}</span>
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-[9px] font-bold uppercase tracking-widest text-black/40">Estado</span>
            <span className="font-semibold text-black/80 truncate">{item.objectStatus}</span>
          </div>
          {item.notes && (
            <div className="mt-2 flex flex-col border-t border-black/5 pt-3 sm:col-span-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-black/40">Notas</span>
              <span className="font-semibold text-black/80 line-clamp-2" title={item.notes}>{item.notes}</span>
            </div>
          )}
        </div>

        <div className="mt-auto pt-6 space-y-3">
          <div className="grid grid-cols-1 gap-1 text-[11px] font-semibold tracking-wide text-black/50 sm:grid-cols-3 sm:gap-2">
            <span>TOTAL: {item.total}</span>
            <span>PRESTADOS: {loaned}</span>
            <span className="text-black">DISPONIBLES: {item.available}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-black/5 ring-1 ring-inset ring-black/5">
            <div className={`h-full ${barColor} transition-all duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)]`} style={{ width: `${percent}%` }} />
          </div>
        </div>

        {onSolicitar && item.available > 0 ? (
          <div className="mt-6 border-t border-black/5 pt-5">
            <button
              type="button"
              className="w-full rounded-full bg-black px-6 py-3 text-sm font-bold text-white shadow-md transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-[1.02] hover:bg-[#1a1a1a] hover:shadow-[0_8px_20px_rgba(0,0,0,0.2)] active:scale-[0.98]"
              onClick={(e) => {
                e.stopPropagation();
                onSolicitar();
              }}
            >
              SOLICITAR PRÉSTAMO
            </button>
          </div>
        ) : null}

        {actions ? (
          <div className="mt-6 border-t border-black/5 pt-5">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}
