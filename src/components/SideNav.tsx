"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppState } from "@/state/app-state";
import {
  IconDashboard,
  IconInventory,
  IconLoans,
  IconReports,
  IconRequests,
  IconRoom,
  IconUser,
} from "@/components/Icons";

export const adminNav = [
  { href: "/app/dashboard",   label: "Dashboard",    Icon: IconDashboard },
  { href: "/app/inventario",  label: "Inventario",   Icon: IconInventory },
  { href: "/app/salones",     label: "Salones",      Icon: IconRoom },
  { href: "/app/solicitudes", label: "Solicitudes",  Icon: IconRequests },
  { href: "/app/prestamos",   label: "Préstamos",    Icon: IconLoans },
  { href: "/app/usuarios",    label: "Usuarios",     Icon: IconUser },
  { href: "/app/reportes",    label: "Reportes",     Icon: IconReports },
];

export const teacherNav = [
  { href: "/app/dashboard",  label: "Inicio",         Icon: IconDashboard },
  { href: "/app/prestamos",  label: "Mis préstamos",  Icon: IconLoans },
  { href: "/app/salones",    label: "Salones",        Icon: IconRoom },
  { href: "/app/inventario", label: "Catálogo",       Icon: IconInventory },
];

export function SideNav() {
  const pathname = usePathname();
  const { state } = useAppState();
  const isAdmin = state.role === "admin";
  const nav = isAdmin ? adminNav : teacherNav;

  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-5rem)] w-[240px] shrink-0 border-r border-black/5 bg-white/30 backdrop-blur-sm xl:w-[280px] lg:block">
      <nav className="flex h-full flex-col gap-2 overflow-y-auto p-6">
        {nav.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          const isAction = href === "/app/solicitar";
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={
                isAction && !active
                  ? "group flex items-center gap-4 rounded-[1.25rem] bg-uniclaretiana-yellow px-4 py-3.5 text-sm font-bold text-uniclaretiana-black shadow-sm ring-1 ring-inset ring-black/5 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:shadow-md"
                  : active
                    ? "group flex items-center gap-4 rounded-[1.25rem] bg-black px-4 py-3.5 text-sm font-bold text-white shadow-md transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                    : "group flex items-center gap-4 rounded-[1.25rem] px-4 py-3.5 text-sm font-bold text-black/60 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-black/[0.03] hover:text-black"
              }
            >
              <Icon className="h-5 w-5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
