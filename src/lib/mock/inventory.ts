export type InventoryCategory =
  | "Hardware"
  | "Periféricos"
  | "Cables"
  | "Eléctrica"
  | "Herramientas"
  | "Controles";

export type InventoryObjectStatus = "OPERATIVO" | "MANTENIMIENTO" | "BAJA";

export type InventoryItem = {
  id: string;
  name: string;
  category: InventoryCategory;
  location?: string;
  responsible?: string;
  notes?: string;
  objectStatus: InventoryObjectStatus;
  total: number;
  available: number;
  active: boolean;
};

export const inventoryCategories: Array<InventoryCategory | "Todos"> = [
  "Todos",
  "Hardware",
  "Periféricos",
  "Cables",
  "Eléctrica",
  "Herramientas",
  "Controles",
];

export const inventoryMock: InventoryItem[] = [
  {
    id: "monitor",
    name: "Monitor",
    category: "Hardware",
    location: "Laboratorio 1",
    responsible: "Coordinación de Tecnología",
    notes: "Verificar cable de poder antes de prestar.",
    objectStatus: "OPERATIVO",
    total: 10,
    available: 4,
    active: true,
  },
  {
    id: "teclado",
    name: "Teclado",
    category: "Periféricos",
    location: "Bodega TI",
    responsible: "Auxiliar de Laboratorio",
    notes: "",
    objectStatus: "OPERATIVO",
    total: 30,
    available: 19,
    active: true,
  },
  {
    id: "mouse",
    name: "Mouse",
    category: "Periféricos",
    location: "Bodega TI",
    responsible: "Auxiliar de Laboratorio",
    notes: "",
    objectStatus: "OPERATIVO",
    total: 30,
    available: 20,
    active: true,
  },
  {
    id: "hdmi",
    name: "Cable HDMI",
    category: "Cables",
    location: "Bodega TI",
    responsible: "Coordinación de Tecnología",
    notes: "",
    objectStatus: "OPERATIVO",
    total: 40,
    available: 12,
    active: true,
  },
  {
    id: "extension",
    name: "Extensión eléctrica",
    category: "Eléctrica",
    location: "Bodega TI",
    responsible: "Auxiliar de Laboratorio",
    notes: "",
    objectStatus: "OPERATIVO",
    total: 15,
    available: 6,
    active: true,
  },
  {
    id: "proyector",
    name: "Proyector",
    category: "Hardware",
    location: "Sala de audiovisuales",
    responsible: "Audiovisuales",
    notes: "Revisar control y cable de poder.",
    objectStatus: "OPERATIVO",
    total: 6,
    available: 3,
    active: true,
  },
  {
    id: "portatil",
    name: "Portátil",
    category: "Hardware",
    location: "Bodega TI",
    responsible: "Coordinación de Tecnología",
    notes: "Entregar con cargador.",
    objectStatus: "OPERATIVO",
    total: 10,
    available: 6,
    active: true,
  },
  {
    id: "televisor",
    name: "Televisor",
    category: "Hardware",
    location: "Sala de audiovisuales",
    responsible: "Audiovisuales",
    notes: "",
    objectStatus: "OPERATIVO",
    total: 4,
    available: 2,
    active: true,
  },
  {
    id: "ctrl-tv",
    name: "Control de televisor",
    category: "Controles",
    location: "Sala de audiovisuales",
    responsible: "Audiovisuales",
    notes: "",
    objectStatus: "OPERATIVO",
    total: 8,
    available: 2,
    active: true,
  },
  {
    id: "ctrl-aire",
    name: "Control de aire acondicionado",
    category: "Controles",
    location: "Recepción de laboratorio",
    responsible: "Servicios Generales",
    notes: "Entregar con pilas.",
    objectStatus: "OPERATIVO",
    total: 8,
    available: 5,
    active: true,
  },
];
