import { ReactNode } from "react";

export function Table({
  headers,
  children,
}: {
  headers: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-black/5 bg-black/[0.02] p-1.5 shadow-sm transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-black/[0.04]">
      <div className="overflow-x-auto rounded-[calc(2rem-0.375rem)] bg-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] ring-1 ring-black/5">
        <table className="w-full border-collapse">
          <thead className="bg-black/[0.02]">
            <tr className="border-b border-black/5">
              {headers.map((h) => (
                <th
                  key={h}
                  className="whitespace-nowrap px-6 py-4 text-left text-[10px] font-bold uppercase tracking-[0.2em] text-black/50"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">{children}</tbody>
        </table>
      </div>
    </div>
  );
}
