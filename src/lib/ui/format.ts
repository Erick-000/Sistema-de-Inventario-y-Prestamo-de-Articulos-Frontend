export function formatDateISO(dateISO: string) {
  const d = new Date(dateISO);
  if (Number.isNaN(d.getTime())) return dateISO;
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
}
