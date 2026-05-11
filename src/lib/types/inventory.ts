export type InventoryCategory = string;

export type InventoryObjectStatus = "OPERATIVO" | "MANTENIMIENTO" | "BAJA";

export type InventoryItem = {
  id: string;
  name: string;
  serial?: string;
  category: InventoryCategory;
  location?: string;
  responsible?: string;
  notes?: string;
  objectStatus: InventoryObjectStatus;
  total: number;
  available: number;
  minStock: number;
  active: boolean;
};

export const inventoryCategories: InventoryCategory[] = [
  "Equipos de cómputo",
  "Audiovisuales",
  "Conectividad",
  "Energía",
  "Herramientas",
  "Mobiliario",
  "Controles",
  "Periféricos",
  "Cables",
  "Otros",
];

export const allInventoryCategories: Array<InventoryCategory | "Todos"> = [
  "Todos",
  ...inventoryCategories,
];

export function sortInventoryCategories(categories: string[]) {
  const order = new Map(inventoryCategories.map((category, index) => [category, index]));
  return [...new Set(categories.filter(Boolean))].sort((a, b) => {
    const indexA = order.get(a) ?? Number.MAX_SAFE_INTEGER;
    const indexB = order.get(b) ?? Number.MAX_SAFE_INTEGER;
    if (indexA !== indexB) return indexA - indexB;
    return a.localeCompare(b, "es", { sensitivity: "base" });
  });
}
