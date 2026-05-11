"use client";

import { ReactNode, useEffect } from "react";

export function Modal({
  open,
  title,
  children,
  onClose,
  footer,
  size = "md",
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizeClass = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  }[size];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
        aria-label="Cerrar"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative flex max-h-[calc(100dvh-1.5rem)] w-full ${sizeClass} flex-col overflow-hidden rounded-[2rem] border border-black/5 bg-black/[0.02] p-1.5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] animate-slide-up sm:max-h-[calc(100dvh-2rem)]`}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[calc(2rem-0.375rem)] bg-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.8)] ring-1 ring-black/5">
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-black/5 bg-black/[0.01] px-5 py-4 sm:px-6 sm:py-5">
            <div className="min-w-0">
              <div id="modal-title" className="truncate text-base font-bold tracking-wide text-black">
                {title}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="group shrink-0 rounded-full border border-black/5 bg-white p-2 text-black/60 shadow-sm transition-all duration-300 hover:scale-105 hover:bg-black/[0.03] hover:text-black"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6">
            {children}
          </div>
          {footer ? (
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-3 border-t border-black/5 bg-black/[0.01] p-5 sm:p-6">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
