export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string | number;
  hint: string;
  icon?: React.ReactNode;
}) {
  return (
    <section className="group rounded-[2rem] border border-black/5 bg-black/[0.02] p-1.5 shadow-sm transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-1 hover:shadow-md hover:bg-black/[0.04]">
      <div className="flex h-full flex-col justify-between rounded-[calc(2rem-0.375rem)] bg-white p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] ring-1 ring-black/5">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[10px] font-bold tracking-[0.2em] text-black/50 uppercase">
            {label}
          </div>
          {icon ? (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-uniclaretiana-yellow/10 text-yellow-600 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110 group-hover:bg-uniclaretiana-yellow/20">
              {icon}
            </div>
          ) : null}
        </div>
        <div className="mt-8">
          <div className="text-4xl font-bold tracking-tight text-black transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1">{value}</div>
          <div className="mt-2 text-sm font-medium text-black/40">{hint}</div>
        </div>
      </div>
    </section>
  );
}
