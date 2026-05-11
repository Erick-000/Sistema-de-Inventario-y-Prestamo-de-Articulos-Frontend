import { ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-uniclaretiana-yellow text-uniclaretiana-black border-transparent hover:bg-[#ffcd00] hover:shadow-[0_8px_20px_rgba(244,196,0,0.4)]",
  secondary:
    "bg-black text-white hover:bg-[#1a1a1a] border-transparent hover:shadow-[0_8px_20px_rgba(0,0,0,0.3)]",
  ghost:
    "bg-white text-black/70 hover:bg-black/[0.03] border-black/10 hover:border-black/20",
  danger:
    "bg-white text-black hover:bg-black/[0.03] border-black/20 hover:text-red-600 hover:border-red-600/30",
};

export function Button({
  children,
  variant = "ghost",
  size = "md",
  type = "button",
  onClick,
  disabled,
  leftIcon,
  className,
}: {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: "sm" | "md";
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  leftIcon?: ReactNode;
  className?: string;
}) {
  const isSm = size === "sm";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`group inline-flex items-center justify-center ${isSm ? "h-9 gap-1.5 px-4 text-xs" : "h-12 gap-3 px-6 text-sm"} rounded-full border font-bold shadow-sm transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ${
        variants[variant]
      } ${className ?? ""}`}
    >
      {leftIcon ? (
        <span className={`flex items-center justify-center rounded-full bg-black/[0.08] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110 ${isSm ? "h-5 w-5" : "h-6 w-6"}`}>
          {leftIcon}
        </span>
      ) : null}
      <span className="truncate">{children}</span>
    </button>
  );
}
