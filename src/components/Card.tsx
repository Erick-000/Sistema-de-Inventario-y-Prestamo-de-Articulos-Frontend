import { ReactNode } from "react";

export function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-black/5 bg-black/[0.02] p-1 shadow-sm transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-black/[0.04] sm:rounded-[2rem] sm:p-1.5">
      <div className="h-full rounded-[calc(1rem-0.25rem)] bg-white p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] ring-1 ring-black/5 sm:rounded-[calc(2rem-0.375rem)] sm:p-6">
        <div className="mb-4 flex items-center justify-between sm:mb-6">
          <h2 className="break-words text-xs font-bold uppercase tracking-widest text-black/60">{title}</h2>
        </div>
        <div>{children}</div>
      </div>
    </section>
  );
}
