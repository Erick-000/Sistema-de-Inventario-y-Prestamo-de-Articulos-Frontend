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
    <div className="flex flex-col gap-4 py-5 sm:gap-6 sm:py-7 lg:flex-row lg:items-end lg:justify-between">
      <div className="flex-1 min-w-0">
        <h1 className="break-words text-2xl font-extrabold tracking-tight text-black sm:text-3xl md:text-4xl lg:text-5xl">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-3xl text-sm font-medium text-black/50 sm:mt-3 sm:text-base md:text-lg">{description}</p>
        ) : null}
      </div>
      {right ? <div className="w-full shrink-0 lg:w-auto">{right}</div> : null}
    </div>
  );
}
