import { ReactNode } from "react";

export function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-[2rem] border border-black/5 bg-black/[0.02] p-1.5 shadow-sm transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-black/[0.04]">
      <div className="h-full rounded-[calc(2rem-0.375rem)] bg-white p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] ring-1 ring-black/5">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest text-black/60">{title}</h2>
        </div>
        <div>{children}</div>
      </div>
    </section>
  );
}
