import { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  right,
}: {
  title: string;
  description?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between py-8">
      <div className="flex-1 min-w-0">
        <h1 className="text-4xl font-extrabold tracking-tight text-black md:text-5xl">{title}</h1>
        {description ? (
          <p className="mt-3 text-base font-medium text-black/50 md:text-lg">{description}</p>
        ) : null}
      </div>
      {right ? <div className="w-full lg:w-auto shrink-0">{right}</div> : null}
    </div>
  );
}
