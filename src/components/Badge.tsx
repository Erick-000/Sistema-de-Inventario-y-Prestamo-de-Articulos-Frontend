export type BadgeVariant =
  | "pending"
  | "approved"
  | "rejected"
  | "active"
  | "returning"
  | "returned"
  | "overdue"
  | "cancelled"
  | "blocked";

const styles: Record<BadgeVariant, string> = {
  pending: "bg-uniclaretiana-yellow/10 text-yellow-700 border-uniclaretiana-yellow/20 ring-1 ring-inset ring-uniclaretiana-yellow/20",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-500/20 ring-1 ring-inset ring-emerald-500/10",
  rejected: "bg-red-50 text-red-700 border-red-500/20 ring-1 ring-inset ring-red-500/10",
  active: "bg-black text-white border-black/20 ring-1 ring-inset ring-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.1)]",
  returning: "bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-inset ring-blue-100",
  returned: "bg-white text-black border-black/10 ring-1 ring-inset ring-black/5",
  overdue: "bg-red-500/10 text-red-700 border-red-500/20 ring-1 ring-inset ring-red-500/20",
  cancelled: "bg-slate-100 text-slate-700 border-slate-500/20 ring-1 ring-inset ring-slate-500/10",
  blocked: "bg-black text-white border-black/20 shadow-md ring-1 ring-inset ring-white/10",
};

export function Badge({
  variant,
  children,
}: {
  variant: BadgeVariant;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] backdrop-blur-sm transition-all duration-300 ${
        styles[variant]
      }`}
    >
      {children}
    </span>
  );
}
