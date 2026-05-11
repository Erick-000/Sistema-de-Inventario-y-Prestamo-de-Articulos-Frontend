"use client";

import { FilterPills } from "@/components/FilterPills";
import { InventoryCard } from "@/components/InventoryCard";
import { PageHeader } from "@/components/PageHeader";
import { SearchInput } from "@/components/SearchInput";
import { Button } from "@/components/Button";
import { ConfirmModal } from "@/components/ConfirmModal";
import { FormModal } from "@/components/FormModal";
import { IconPlus, IconPencil, IconSliders, IconTrash, IconUpload, IconDownload } from "@/components/Icons";
import type {
  InventoryCategory,
  InventoryItem,
  InventoryObjectStatus,
} from "@/lib/types/inventory";
import { inventoryCategories, sortInventoryCategories } from "@/lib/types/inventory";
import { useAppState } from "@/state/app-state";
import { apiFetch } from "@/lib/api/client";
import { Modal } from "@/components/Modal";
import { useEffect, useMemo, useState, useRef } from "react";
import * as XLSX from "xlsx";

type ArticleCategoryDto = {
  _id: string;
  nombre: string;
  activo: boolean;
  prestable?: boolean;
  maxLoanMinutes?: number;
  requiereSerial?: boolean;
};

const MAX_ARTICLE_LOAN_DAYS = 0;
const MAX_ARTICLE_LOAN_HOURS = 4;
const ARTICLE_LOAN_LIMIT_TEXT = "Los artículos deben devolverse el mismo día.";

function addDaysISO(dateISO: string, days: number) {
  const date = new Date(`${dateISO}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function timeToMinutes(value: string) {
  const [hh, mm] = value.split(":").map(Number);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
  return hh * 60 + mm;
}

function minutesToTime(value: number) {
  const minutes = Math.max(0, Math.min(23 * 60 + 59, Math.floor(value)));
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

function addHoursToTime(value: string, hours: number) {
  const minutes = timeToMinutes(value) ?? 8 * 60;
  return minutesToTime(minutes + hours * 60);
}

export default function InventarioPage() {
  const { state, reload } = useAppState();
  const [category, setCategory] = useState<string>("Todos");
  const [query, setQuery] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [formName, setFormName] = useState("");
  const [formSerial, setFormSerial] = useState("");
  const [formCategory, setFormCategory] = useState<InventoryCategory>("Equipos de cómputo");
  const [formCustomCategory, setFormCustomCategory] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formResponsible, setFormResponsible] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formObjectStatus, setFormObjectStatus] = useState<InventoryObjectStatus>(
    "OPERATIVO",
  );
  const [formTotal, setFormTotal] = useState("0");
  const [formAvailable, setFormAvailable] = useState("0");
  const [formMinStock, setFormMinStock] = useState("0");

  const [adjustTotal, setAdjustTotal] = useState("0");
  const [adjustAvailable, setAdjustAvailable] = useState("0");
  const [categories, setCategories] = useState<ArticleCategoryDto[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [history, setHistory] = useState<
    Array<{
      _id: string;
      accion: string;
      entidadNombre?: string;
      actorNombre?: string;
      metadata?: Record<string, unknown>;
      createdAt?: string;
    }>
  >([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const activeInventory = useMemo(
    () => state.inventory.filter((it) => it.active),
    [state.inventory],
  );

  const categoryOptions = useMemo(
    () => [
      { value: "Todos", label: "Todos" },
      ...sortInventoryCategories([
        ...(categories.length > 0 ? categories.filter((c) => c.activo).map((c) => c.nombre) : inventoryCategories),
        ...activeInventory.map((it) => it.category),
      ]).map((c) => ({ value: c, label: c })),
    ],
    [activeInventory, categories],
  );

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();

    return activeInventory
      .filter((it) => (category === "Todos" ? true : it.category === category))
      .filter((it) => {
        if (!q) return true;
        return (
          it.name.toLowerCase().includes(q) ||
          (it.serial ? it.serial.toLowerCase().includes(q) : false) ||
          it.category.toLowerCase().includes(q) ||
          it.id.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const byCategory = a.category.localeCompare(b.category, "es", { sensitivity: "base" });
        if (byCategory !== 0) return byCategory;
        return a.name.localeCompare(b.name, "es", { sensitivity: "base" });
      });
  }, [activeInventory, category, query]);

  const selected: InventoryItem | undefined = useMemo(() => {
    if (!selectedId) return undefined;
    return state.inventory.find((it) => it.id === selectedId);
  }, [selectedId, state.inventory]);

  const canManage = state.role === "admin";
  const isTeacher = state.role === "teacher";
  const effectiveFormCategory = formCustomCategory.trim() || formCategory;

  async function loadCategories() {
    const data = await apiFetch<ArticleCategoryDto[]>(
      "/api/article-categories?includeInactive=true",
    );
    setCategories(data);
  }

  useEffect(() => {
    loadCategories().catch(() => {});
  }, []);

  // ── Loan modal state (teacher) ──────────────────────────────────
  const [loanItem, setLoanItem] = useState<InventoryItem | null>(null);
  const [loanQty, setLoanQty] = useState("1");
  const [loanStart, setLoanStart] = useState(new Date().toISOString().slice(0, 10));
  const [loanDue, setLoanDue] = useState(new Date().toISOString().slice(0, 10));
  const [loanStartTime, setLoanStartTime] = useState("08:00");
  const [loanEndTime, setLoanEndTime] = useState("09:00");
  const [loanError, setLoanError] = useState<string | null>(null);
  const [loanSuccess, setLoanSuccess] = useState(false);

  function openLoanModal(item: InventoryItem) {
    setLoanItem(item);
    setLoanQty("1");
    setLoanStart(new Date().toISOString().slice(0, 10));
    setLoanDue(new Date().toISOString().slice(0, 10));
    setLoanStartTime("08:00");
    setLoanEndTime("09:00");
    setLoanError(null);
    setLoanSuccess(false);
  }

  async function submitLoan() {
    if (!loanItem) return;
    setLoanError(null);
    setLoanSuccess(false);
    const qty = Math.floor(Number(loanQty));
    if (!Number.isFinite(qty) || qty < 1) {
      setLoanError("Ingresa una cantidad válida.");
      return;
    }
    if (qty > loanItem.available) {
      setLoanError(`Solo hay ${loanItem.available} unidad(es) disponible(s).`);
      return;
    }
    if (loanStart > loanDue) {
      setLoanError("La fecha límite debe ser igual o posterior a la fecha de inicio.");
      return;
    }
    if (loanDue > addDaysISO(loanStart, MAX_ARTICLE_LOAN_DAYS)) {
      setLoanError(ARTICLE_LOAN_LIMIT_TEXT);
      return;
    }
    const startMin = timeToMinutes(loanStartTime);
    const endMin = timeToMinutes(loanEndTime);
    if (startMin === null || endMin === null || endMin <= startMin) {
      setLoanError("La hora de devolución debe ser posterior a la hora de inicio.");
      return;
    }
    if (endMin - startMin > MAX_ARTICLE_LOAN_HOURS * 60) {
      setLoanError(`El préstamo no puede superar ${MAX_ARTICLE_LOAN_HOURS} horas.`);
      return;
    }
    try {
      await apiFetch("/api/loans", {
        method: "POST",
        body: JSON.stringify({
          fechaInicio: loanStart,
          fechaLimite: loanDue,
          horaInicio: loanStartTime,
          horaFin: loanEndTime,
          items: [{ articuloId: loanItem.id, cantidad: qty }],
        }),
      });
      setLoanSuccess(true);
      await reload();
    } catch (err) {
      setLoanError(err instanceof Error ? err.message : "No se pudo enviar la solicitud.");
    }
  }

  const createDisabled = useMemo(() => {
    if (!formName.trim()) return true;
    if (!effectiveFormCategory.trim()) return true;
    const total = Number(formTotal);
    const available = Number(formAvailable);
    const minStock = Number(formMinStock);
    if (!Number.isFinite(total) || !Number.isFinite(available)) return true;
    if (!Number.isFinite(minStock)) return true;
    if (total < 0 || available < 0) return true;
    if (minStock < 0) return true;
    if (available > total) return true;
    return false;
  }, [effectiveFormCategory, formAvailable, formMinStock, formName, formTotal]);

  const editDisabled = useMemo(() => {
    if (!selected) return true;
    if (!formName.trim()) return true;
    if (!effectiveFormCategory.trim()) return true;
    const total = Number(formTotal);
    const available = Number(formAvailable);
    const minStock = Number(formMinStock);
    if (!Number.isFinite(total) || !Number.isFinite(available)) return true;
    if (!Number.isFinite(minStock)) return true;
    if (total < 0 || available < 0) return true;
    if (minStock < 0) return true;
    if (available > total) return true;
    return false;
  }, [effectiveFormCategory, formAvailable, formMinStock, formName, formTotal, selected]);

  const adjustDisabled = useMemo(() => {
    if (!selected) return true;
    const total = Number(adjustTotal);
    const available = Number(adjustAvailable);
    if (!Number.isFinite(total) || !Number.isFinite(available)) return true;
    if (total < 0 || available < 0) return true;
    if (available > total) return true;
    return false;
  }, [adjustAvailable, adjustTotal, selected]);

  function openCreate() {
    setFormName("");
    setFormSerial("");
    setFormCategory("Equipos de cómputo");
    setFormCustomCategory("");
    setFormLocation("");
    setFormResponsible("");
    setFormNotes("");
    setFormObjectStatus("OPERATIVO");
    setFormTotal("0");
    setFormAvailable("0");
    setFormMinStock("0");
    setCreateOpen(true);
  }

  function openEdit(item: InventoryItem) {
    setSelectedId(item.id);
    setFormName(item.name);
    setFormSerial(item.serial ?? "");
    setFormCategory(item.category);
    setFormCustomCategory("");
    setFormLocation(item.location ?? "");
    setFormResponsible(item.responsible ?? "");
    setFormNotes(item.notes ?? "");
    setFormObjectStatus(item.objectStatus);
    setFormTotal(String(item.total));
    setFormAvailable(String(item.available));
    setFormMinStock(String(item.minStock));
    setEditOpen(true);
  }

  function openAdjust(item: InventoryItem) {
    setSelectedId(item.id);
    setAdjustTotal(String(item.total));
    setAdjustAvailable(String(item.available));
    setAdjustOpen(true);
  }

  function openDeactivate(item: InventoryItem) {
    setSelectedId(item.id);
    setDeactivateOpen(true);
  }

  async function openHistory(item: InventoryItem) {
    setSelectedId(item.id);
    setHistoryOpen(true);
    setHistoryLoading(true);
    try {
      const data = await apiFetch<typeof history>(
        `/api/audit?entityType=article&entityId=${item.id}&limit=60`,
      );
      setHistory(data);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }

  async function submitCategory() {
    const nombre = newCategoryName.trim();
    if (!nombre) return;
    await apiFetch("/api/article-categories", {
      method: "POST",
      body: JSON.stringify({ nombre }),
    });
    setNewCategoryName("");
    await loadCategories();
  }

  async function toggleCategory(id: string, activo: boolean) {
    await apiFetch(`/api/article-categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ activo }),
    });
    await loadCategories();
  }

  async function updateCategoryRules(
    id: string,
    patch: Partial<Pick<ArticleCategoryDto, "prestable" | "maxLoanMinutes" | "requiereSerial">>,
  ) {
    await apiFetch(`/api/article-categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    await loadCategories();
  }

  function historyTitle(action: string) {
    const labels: Record<string, string> = {
      "article.created": "Artículo creado",
      "article.created.bulk": "Artículo importado",
      "article.updated": "Artículo actualizado",
      "article.deactivated": "Artículo eliminado",
      "loan.requested": "Solicitud de préstamo",
      "loan.approved": "Préstamo aprobado",
      "loan.delivered": "Artículo entregado",
      "loan.returned": "Artículo devuelto",
      "loan.cancelled.admin": "Préstamo cancelado",
      "category.updated": "Categoría actualizada",
    };
    return labels[action] ?? action;
  }

  function historySummary(item: { accion: string; metadata?: Record<string, unknown> }) {
    const metadata = item.metadata ?? {};
    if (item.accion === "article.updated") {
      const patch = metadata.patch as Record<string, unknown> | undefined;
      const keys = patch ? Object.keys(patch) : [];
      return keys.length ? `Cambios: ${keys.join(", ")}` : "Se actualizó la información del artículo.";
    }
    if (item.accion === "loan.returned") {
      return metadata.returnCondition === "ISSUE"
        ? `Devuelto con novedad: ${String(metadata.returnNote ?? "")}`
        : "Devuelto sin novedades.";
    }
    if (item.accion === "loan.requested") {
      return "El artículo fue incluido en una solicitud de préstamo.";
    }
    return undefined;
  }

  function submitCreate() {
    void (async () => {
      await apiFetch("/api/articles", {
        method: "POST",
        body: JSON.stringify({
          nombre: formName.trim(),
          serial: formSerial.trim() ? formSerial.trim() : undefined,
          categoria: effectiveFormCategory.trim(),
          ubicacion: formLocation.trim() ? formLocation.trim() : undefined,
          responsable: formResponsible.trim() ? formResponsible.trim() : undefined,
          notas: formNotes.trim() ? formNotes.trim() : undefined,
          estadoObjeto: formObjectStatus,
          stockTotal: Math.max(0, Math.floor(Number(formTotal))),
          stockDisponible: Math.max(0, Math.floor(Number(formAvailable))),
          stockMinimo: Math.max(0, Math.floor(Number(formMinStock))),
          activo: true,
        }),
      });
      setCreateOpen(false);
      await reload();
    })();
  }

  function submitEdit() {
    if (!selectedId) return;
    void (async () => {
      await apiFetch(`/api/articles/${selectedId}`, {
        method: "PATCH",
        body: JSON.stringify({
          nombre: formName.trim(),
          serial: formSerial.trim() ? formSerial.trim() : undefined,
          categoria: effectiveFormCategory.trim(),
          ubicacion: formLocation.trim() ? formLocation.trim() : undefined,
          responsable: formResponsible.trim() ? formResponsible.trim() : undefined,
          notas: formNotes.trim() ? formNotes.trim() : undefined,
          estadoObjeto: formObjectStatus,
          stockTotal: Math.max(0, Math.floor(Number(formTotal))),
          stockDisponible: Math.max(0, Math.floor(Number(formAvailable))),
          stockMinimo: Math.max(0, Math.floor(Number(formMinStock))),
        }),
      });
      setEditOpen(false);
      await reload();
    })();
  }

  function submitAdjust() {
    if (!selectedId) return;
    void (async () => {
      await apiFetch(`/api/articles/${selectedId}`, {
        method: "PATCH",
        body: JSON.stringify({
          stockTotal: Math.max(0, Math.floor(Number(adjustTotal))),
          stockDisponible: Math.max(0, Math.floor(Number(adjustAvailable))),
        }),
      });
      setAdjustOpen(false);
      await reload();
    })();
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

      if (!rows || rows.length === 0) {
        alert("El archivo está vacío o no se pudo leer correctamente.");
        return;
      }

      const formatted = rows.map((row) => ({
        nombre: String(row["Nombre"] ?? row["nombre"] ?? ""),
        serial: row["Serial"] || row["serial"] ? String(row["Serial"] ?? row["serial"]) : undefined,
        categoria: String(row["Categoría"] ?? row["categoria"] ?? row["Categoria"] ?? "Otros"),
        ubicacion: row["Ubicación"] || row["ubicacion"] ? String(row["Ubicación"] ?? row["ubicacion"]) : undefined,
        responsable: row["Responsable"] || row["responsable"] ? String(row["Responsable"] ?? row["responsable"]) : undefined,
        notas: row["Notas"] || row["notas"] ? String(row["Notas"] ?? row["notas"]) : undefined,
        estadoObjeto: row["Estado"] ?? row["estadoObjeto"] ?? "OPERATIVO",
        stockTotal: Number(row["Stock Total"] ?? row["stockTotal"] ?? 0),
        stockDisponible: Number(row["Stock Disponible"] ?? row["stockDisponible"] ?? 0),
        stockMinimo: Number(row["Stock Mínimo"] ?? row["stockMinimo"] ?? 0),
        activo: true,
      })).filter((item) => item.nombre && item.nombre.trim() !== "");

      if (formatted.length === 0) {
        alert("No se encontraron registros válidos para importar.");
        return;
      }

      await apiFetch("/api/articles/bulk", {
        method: "POST",
        body: JSON.stringify(formatted),
      });

      await reload();
      alert(`Se importaron ${formatted.length} artículos correctamente.`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Revisa el formato del archivo";
      alert("Error al importar: " + message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function exportFilteredInventory() {
    const rows = items.map((item) => ({
      Código: item.serial || `UIB-${item.id.slice(-6).toUpperCase()}`,
      Nombre: item.name,
      Categoría: item.category,
      Ubicación: item.location ?? "",
      Responsable: item.responsible ?? "",
      Estado: item.objectStatus,
      "Stock Total": item.total,
      "Stock Disponible": item.available,
      "Stock Mínimo": item.minStock,
      Notas: item.notes ?? "",
    }));
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventario");
    XLSX.writeFile(workbook, "inventario-filtrado.xlsx");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventario"
        description="Catálogo de artículos con stock total, prestado y disponible."
        right={
          <div className="flex w-full flex-col gap-3 md:flex-row md:items-center xl:justify-end">
            <div className="w-full md:max-w-md xl:max-w-sm">
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder="Buscar por nombre, categoría o ID"
              />
            </div>
            {canManage ? (
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={(e) => { void handleFileUpload(e); }}
                />
                <Button
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                  leftIcon={<IconUpload className="h-5 w-5" />}
                  disabled={uploading}
                >
                  {uploading ? "Importando..." : "Importar"}
                </Button>
                <Button
                  variant="ghost"
                  onClick={exportFilteredInventory}
                  leftIcon={<IconDownload className="h-5 w-5" />}
                  disabled={items.length === 0}
                >
                  Exportar
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setCategoriesOpen(true)}
                >
                  Categorías
                </Button>
                <Button
                  variant="secondary"
                  onClick={openCreate}
                  leftIcon={<IconPlus className="h-5 w-5" />}
                >
                  Nuevo artículo
                </Button>
              </div>
            ) : null}
          </div>
        }
      />

      <div className="flex flex-col gap-3">
        <div className="text-xs font-semibold tracking-widest text-black/60">
          CATEGORÍAS
        </div>
        <FilterPills options={categoryOptions} value={category} onChange={setCategory} />
      </div>

      {items.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-black/[0.01] p-12 text-center">
          <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-black/[0.04] text-black/40">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
          </span>
          <div className="text-sm font-semibold text-black/70">No se encontraron artículos</div>
          <div className="mt-1 text-xs text-black/50">Prueba ajustando los filtros o tu búsqueda.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <InventoryCard
              key={item.id}
              item={item}
              onSolicitar={isTeacher ? () => openLoanModal(item) : undefined}
              actions={
                canManage ? (
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      className="w-full"
                      variant="ghost"
                      onClick={() => openEdit(item)}
                      leftIcon={<IconPencil />}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      className="w-full"
                      variant="ghost"
                      onClick={() => {
                        void openHistory(item);
                      }}
                    >
                      Historial
                    </Button>
                    <Button
                      size="sm"
                      className="w-full"
                      variant="ghost"
                      onClick={() => openAdjust(item)}
                      leftIcon={<IconSliders />}
                    >
                      Stock
                    </Button>
                    <Button
                      size="sm"
                      className="w-full"
                      variant="danger"
                      onClick={() => openDeactivate(item)}
                      leftIcon={<IconTrash />}
                    >
                      Eliminar
                    </Button>
                  </div>
                ) : undefined
              }
            />
          ))}
        </div>
      )}
      <FormModal
        open={createOpen}
        title="Nuevo artículo"
        submitText="Crear"
        cancelText="Cancelar"
        onClose={() => setCreateOpen(false)}
        onSubmit={submitCreate}
        submitDisabled={createDisabled}
      >
        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <label className="space-y-1 md:col-span-2">
            <div className="text-xs font-semibold tracking-widest text-black/60">Nombre</div>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-black outline-none focus:border-black/30"
              placeholder="Nombre del artículo"
            />
          </label>

          <label className="space-y-1">
            <div className="text-xs font-semibold tracking-widest text-black/60">Serial</div>
            <input
              type="text"
              value={formSerial}
              onChange={(e) => setFormSerial(e.target.value)}
              className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-black outline-none focus:border-black/30"
              placeholder="Ej: SN-12345"
            />
          </label>

          <label className="space-y-1">
            <div className="text-xs font-semibold tracking-widest text-black/60">Categoría</div>
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value as InventoryCategory)}
              className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-black outline-none focus:border-black/30"
            >
              {sortInventoryCategories([
                ...(categories.length > 0 ? categories.filter((item) => item.activo).map((item) => item.nombre) : inventoryCategories),
                ...activeInventory.map((it) => it.category),
              ]).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
            </select>
          </label>

          <label className="space-y-1">
            <div className="text-xs font-semibold tracking-widest text-black/60">Nueva categoría</div>
            <input
              type="text"
              value={formCustomCategory}
              onChange={(e) => setFormCustomCategory(e.target.value)}
              className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-black outline-none focus:border-black/30"
              placeholder="Opcional: crea una categoría"
            />
          </label>

          <label className="space-y-1">
            <div className="text-xs font-semibold tracking-widest text-black/60">Ubicación</div>
            <input
              type="text"
              value={formLocation}
              onChange={(e) => setFormLocation(e.target.value)}
              className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-black outline-none focus:border-black/30"
              placeholder="Ej: Laboratorio 1, Bodega TI"
            />
          </label>

          <label className="space-y-1">
            <div className="text-xs font-semibold tracking-widest text-black/60">Responsable</div>
            <input
              type="text"
              value={formResponsible}
              onChange={(e) => setFormResponsible(e.target.value)}
              className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-black outline-none focus:border-black/30"
              placeholder="Ej: Coordinación de Tecnología"
            />
          </label>

          <label className="space-y-1 md:col-span-2">
            <div className="text-xs font-semibold tracking-widest text-black/60">Notas</div>
            <input
              type="text"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-black outline-none focus:border-black/30"
              placeholder="Observaciones (opcional)"
            />
          </label>

          <label className="space-y-1">
            <div className="text-xs font-semibold tracking-widest text-black/60">Estado del objeto</div>
            <select
              value={formObjectStatus}
              onChange={(e) => setFormObjectStatus(e.target.value as InventoryObjectStatus)}
              className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-black outline-none focus:border-black/30"
            >
              <option value="OPERATIVO">OPERATIVO</option>
              <option value="MANTENIMIENTO">MANTENIMIENTO</option>
              <option value="BAJA">BAJA</option>
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3 md:col-span-2">
            <label className="space-y-1">
              <div className="text-xs font-semibold tracking-widest text-black/60">Stock total</div>
              <input
                type="number"
                min={0}
                step={1}
                value={formTotal}
                onChange={(e) => setFormTotal(e.target.value)}
                className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-black outline-none focus:border-black/30"
              />
            </label>
            <label className="space-y-1">
              <div className="text-xs font-semibold tracking-widest text-black/60">Stock disponible</div>
              <input
                type="number"
                min={0}
                step={1}
                value={formAvailable}
                onChange={(e) => setFormAvailable(e.target.value)}
                className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-black outline-none focus:border-black/30"
              />
            </label>
          </div>

          <label className="space-y-1 md:col-span-2">
            <div className="text-xs font-semibold tracking-widest text-black/60">Stock mínimo</div>
            <input
              type="number"
              min={0}
              step={1}
              value={formMinStock}
              onChange={(e) => setFormMinStock(e.target.value)}
              className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-black outline-none focus:border-black/30"
            />
          </label>
        </div>
      </FormModal>

      <FormModal
        open={editOpen}
        title="Editar artículo"
        submitText="Guardar"
        cancelText="Cancelar"
        onClose={() => setEditOpen(false)}
        onSubmit={submitEdit}
        submitDisabled={editDisabled}
      >
        <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <div className="rounded-xl border border-black/10 bg-black/[0.02] px-3 py-2 text-xs font-semibold text-black/60 md:col-span-2">
            CÓDIGO: {selected?.serial || (selectedId ? `UIB-${selectedId.slice(-6).toUpperCase()}` : "")}
          </div>

          <label className="space-y-1 md:col-span-2">
            <div className="text-xs font-semibold tracking-widest text-black/60">Nombre</div>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-black outline-none focus:border-black/30"
            />
          </label>

          <label className="space-y-1">
            <div className="text-xs font-semibold tracking-widest text-black/60">Serial</div>
            <input
              type="text"
              value={formSerial}
              onChange={(e) => setFormSerial(e.target.value)}
              className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-black outline-none focus:border-black/30"
            />
          </label>

          <label className="space-y-1">
            <div className="text-xs font-semibold tracking-widest text-black/60">Categoría</div>
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value as InventoryCategory)}
              className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-black outline-none focus:border-black/30"
            >
              {sortInventoryCategories([
                ...(categories.length > 0 ? categories.filter((item) => item.activo).map((item) => item.nombre) : inventoryCategories),
                ...activeInventory.map((it) => it.category),
              ]).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
            </select>
          </label>

          <label className="space-y-1">
            <div className="text-xs font-semibold tracking-widest text-black/60">Nueva categoría</div>
            <input
              type="text"
              value={formCustomCategory}
              onChange={(e) => setFormCustomCategory(e.target.value)}
              className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-black outline-none focus:border-black/30"
              placeholder="Opcional: reemplaza la categoría"
            />
          </label>

          <label className="space-y-1">
            <div className="text-xs font-semibold tracking-widest text-black/60">Ubicación</div>
            <input
              type="text"
              value={formLocation}
              onChange={(e) => setFormLocation(e.target.value)}
              className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-black outline-none focus:border-black/30"
            />
          </label>

          <label className="space-y-1">
            <div className="text-xs font-semibold tracking-widest text-black/60">Responsable</div>
            <input
              type="text"
              value={formResponsible}
              onChange={(e) => setFormResponsible(e.target.value)}
              className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-black outline-none focus:border-black/30"
            />
          </label>

          <label className="space-y-1 md:col-span-2">
            <div className="text-xs font-semibold tracking-widest text-black/60">Notas</div>
            <input
              type="text"
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-black outline-none focus:border-black/30"
            />
          </label>

          <label className="space-y-1">
            <div className="text-xs font-semibold tracking-widest text-black/60">Estado del objeto</div>
            <select
              value={formObjectStatus}
              onChange={(e) => setFormObjectStatus(e.target.value as InventoryObjectStatus)}
              className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-black outline-none focus:border-black/30"
            >
              <option value="OPERATIVO">OPERATIVO</option>
              <option value="MANTENIMIENTO">MANTENIMIENTO</option>
              <option value="BAJA">BAJA</option>
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3 md:col-span-2">
            <label className="space-y-1">
              <div className="text-xs font-semibold tracking-widest text-black/60">Stock total</div>
              <input
                type="number"
                min={0}
                step={1}
                value={formTotal}
                onChange={(e) => setFormTotal(e.target.value)}
                className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-black outline-none focus:border-black/30"
              />
            </label>
            <label className="space-y-1">
              <div className="text-xs font-semibold tracking-widest text-black/60">Stock disponible</div>
              <input
                type="number"
                min={0}
                step={1}
                value={formAvailable}
                onChange={(e) => setFormAvailable(e.target.value)}
                className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-black outline-none focus:border-black/30"
              />
            </label>
          </div>

          <label className="space-y-1 md:col-span-2">
            <div className="text-xs font-semibold tracking-widest text-black/60">Stock mínimo</div>
            <input
              type="number"
              min={0}
              step={1}
              value={formMinStock}
              onChange={(e) => setFormMinStock(e.target.value)}
              className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-black outline-none focus:border-black/30"
            />
          </label>
        </div>
      </FormModal>

      <FormModal
        open={adjustOpen}
        title="Ajustar stock"
        submitText="Aplicar"
        cancelText="Cancelar"
        onClose={() => setAdjustOpen(false)}
        onSubmit={submitAdjust}
        submitDisabled={adjustDisabled}
      >
        <div className="grid grid-cols-1 gap-3 text-sm">
          <div className="rounded-xl border border-black/10 bg-black/[0.02] px-3 py-2 text-xs font-semibold text-black/60">
            {selected ? `${selected.name} (CÓDIGO: ${selected.serial || `UIB-${selected.id.slice(-6).toUpperCase()}`})` : ""}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1">
              <div className="text-xs font-semibold tracking-widest text-black/60">Stock total</div>
              <input
                type="number"
                min={0}
                step={1}
                value={adjustTotal}
                onChange={(e) => setAdjustTotal(e.target.value)}
                className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-black outline-none focus:border-black/30"
              />
            </label>
            <label className="space-y-1">
              <div className="text-xs font-semibold tracking-widest text-black/60">Stock disponible</div>
              <input
                type="number"
                min={0}
                step={1}
                value={adjustAvailable}
                onChange={(e) => setAdjustAvailable(e.target.value)}
                className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-black outline-none focus:border-black/30"
              />
            </label>
          </div>
        </div>
      </FormModal>

      <ConfirmModal
        open={deactivateOpen}
        title="Eliminar artículo"
        description={
          selected ? (
            <div>
              ¿Seguro que deseas eliminar <span className="font-semibold">{selected.name}</span>?
              <div className="mt-2 text-xs text-black/60">
                Esto lo desactiva (no se borra) para evitar perder historial.
              </div>
            </div>
          ) : null
        }
        confirmText="Eliminar"
        cancelText="Cancelar"
        onClose={() => setDeactivateOpen(false)}
        onConfirm={() => {
          if (!selectedId) return;
          void (async () => {
            await apiFetch(`/api/articles/${selectedId}`, { method: "DELETE" });
            setDeactivateOpen(false);
            await reload();
          })();
        }}
      />

      <Modal
        open={categoriesOpen}
        title="Categorías de artículos"
        size="lg"
        onClose={() => setCategoriesOpen(false)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setCategoriesOpen(false)}>
              Cerrar
            </Button>
            <Button variant="secondary" disabled={!newCategoryName.trim()} onClick={() => { void submitCategory(); }}>
              Crear categoría
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-black/10 bg-black/[0.015] p-3">
            <label className="mb-1.5 block text-xs font-semibold tracking-widest text-black/60">
              NUEVA CATEGORÍA
            </label>
            <input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-uniclaretiana-yellow"
              placeholder="Ej: Laboratorio, Audio, Redes..."
            />
          </div>

          <div className="space-y-2">
            {categories.map((item) => (
              <div
                key={item._id}
                className="rounded-xl border border-black/10 bg-white px-4 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-black">{item.nombre}</div>
                    <div className="text-xs text-black/50">
                      {item.activo ? "Disponible en formularios" : "Oculta para nuevas cargas"}
                    </div>
                  </div>
                  <Button
                    variant={item.activo ? "ghost" : "secondary"}
                    onClick={() => {
                      void toggleCategory(item._id, !item.activo);
                    }}
                  >
                    {item.activo ? "Ocultar" : "Activar"}
                  </Button>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
                  <label className="flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2 font-semibold text-black/60">
                    <input
                      type="checkbox"
                      checked={item.prestable ?? true}
                      onChange={(e) => {
                        void updateCategoryRules(item._id, { prestable: e.target.checked });
                      }}
                    />
                    Prestable
                  </label>
                  <label className="flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2 font-semibold text-black/60">
                    <input
                      type="checkbox"
                      checked={item.requiereSerial ?? false}
                      onChange={(e) => {
                        void updateCategoryRules(item._id, { requiereSerial: e.target.checked });
                      }}
                    />
                    Requiere serial
                  </label>
                  <label className="flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2 font-semibold text-black/60">
                    Máx.
                    <input
                      type="number"
                      min={15}
                      max={480}
                      step={15}
                      value={item.maxLoanMinutes ?? 240}
                      disabled={item.prestable === false}
                      onChange={(e) => {
                        void updateCategoryRules(item._id, {
                          maxLoanMinutes: Number(e.target.value),
                        });
                      }}
                      className="h-7 w-20 rounded-md border border-black/10 px-2 text-xs outline-none focus:border-uniclaretiana-yellow"
                    />
                    min
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <Modal
        open={historyOpen}
        title={`Historial — ${selected?.name ?? "Artículo"}`}
        size="lg"
        onClose={() => setHistoryOpen(false)}
      >
        {historyLoading ? (
          <div className="text-sm text-black/50">Cargando historial...</div>
        ) : history.length === 0 ? (
          <div className="rounded-xl border border-dashed border-black/15 p-6 text-center text-sm text-black/50">
            Este artículo todavía no tiene eventos registrados.
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div key={item._id} className="rounded-xl border border-black/10 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-black">{historyTitle(item.accion)}</div>
                    <div className="mt-0.5 text-xs text-black/50">
                      {item.actorNombre ? `Por ${item.actorNombre}` : "Evento del sistema"}
                    </div>
                    {historySummary(item) ? (
                      <div className="mt-1 text-xs text-black/60">{historySummary(item)}</div>
                    ) : null}
                  </div>
                  <div className="text-xs font-semibold text-black/50">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString("es-CO") : ""}
                  </div>
                </div>
                {item.metadata ? (
                  <pre className="mt-3 max-h-32 overflow-auto rounded-lg bg-black/[0.03] p-3 text-[11px] leading-relaxed text-black/60">
                    {JSON.stringify(item.metadata, null, 2)}
                  </pre>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Loan request modal — teacher only */}
      <Modal
        open={loanItem !== null}
        title={`Solicitar préstamo — ${loanItem?.name ?? ""}`}
        onClose={() => setLoanItem(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setLoanItem(null)}>
              Cancelar
            </Button>
            <Button
              variant="secondary"
              disabled={
                loanSuccess ||
                !loanItem ||
                Number(loanQty) < 1 ||
                Number(loanQty) > loanItem.available ||
                loanStart > loanDue ||
                loanDue > addDaysISO(loanStart, MAX_ARTICLE_LOAN_DAYS) ||
                (timeToMinutes(loanEndTime) ?? 0) <= (timeToMinutes(loanStartTime) ?? 0) ||
                ((timeToMinutes(loanEndTime) ?? 0) - (timeToMinutes(loanStartTime) ?? 0)) > MAX_ARTICLE_LOAN_HOURS * 60
              }
              onClick={() => { void submitLoan(); }}
            >
              Enviar solicitud
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-sm">
          {loanItem && (
            <div className="rounded-xl border border-black/10 bg-black/[0.02] px-4 py-3 text-xs text-black/70">
              {loanItem.serial ? <span>Serial: <strong>{loanItem.serial}</strong> · </span> : null}
              Disponibles: <strong>{loanItem.available}</strong>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-widest text-black/60">FECHA DE INICIO</label>
              <input
                type="date"
                className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-uniclaretiana-yellow"
                value={loanStart}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => {
                  const nextStart = e.target.value;
                  setLoanStart(nextStart);
                  const maxDue = addDaysISO(nextStart, MAX_ARTICLE_LOAN_DAYS);
                  if (loanDue < nextStart || loanDue > maxDue) setLoanDue(nextStart);
                }}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-widest text-black/60">FECHA LÍMITE</label>
              <input
                type="date"
                className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-uniclaretiana-yellow"
                value={loanDue}
                min={loanStart}
                max={addDaysISO(loanStart, MAX_ARTICLE_LOAN_DAYS)}
                onChange={(e) => setLoanDue(e.target.value)}
              />
            </div>
          </div>
          <p className="text-xs font-semibold text-black/50">
            Los artículos son para uso institucional. {ARTICLE_LOAN_LIMIT_TEXT} Máximo {MAX_ARTICLE_LOAN_HOURS} horas.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-widest text-black/60">HORA DE ENTREGA</label>
              <input
                type="time"
                className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-uniclaretiana-yellow"
                value={loanStartTime}
                onChange={(e) => {
                  const nextStart = e.target.value;
                  setLoanStartTime(nextStart);
                  if ((timeToMinutes(loanEndTime) ?? 0) <= (timeToMinutes(nextStart) ?? 0)) {
                    setLoanEndTime(addHoursToTime(nextStart, 1));
                  }
                }}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-widest text-black/60">HORA DE DEVOLUCIÓN</label>
              <input
                type="time"
                className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-uniclaretiana-yellow"
                value={loanEndTime}
                min={loanStartTime}
                max={addHoursToTime(loanStartTime, MAX_ARTICLE_LOAN_HOURS)}
                onChange={(e) => setLoanEndTime(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold tracking-widest text-black/60">CANTIDAD</label>
            <input
              type="number"
              className="h-10 w-full rounded-xl border border-black/10 bg-white px-3 text-sm outline-none focus:border-uniclaretiana-yellow"
              min={1}
              max={loanItem?.available ?? 1}
              value={loanQty}
              onChange={(e) => setLoanQty(e.target.value)}
            />
          </div>

          {loanError ? (
            <p className="text-xs font-semibold text-red-600">{loanError}</p>
          ) : null}
          {loanSuccess ? (
            <p className="text-xs font-semibold text-green-600">Solicitud enviada correctamente.</p>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
