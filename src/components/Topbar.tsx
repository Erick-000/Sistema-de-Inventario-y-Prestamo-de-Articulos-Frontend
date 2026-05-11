"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { IconBell, IconLogout, IconUser } from "@/components/Icons";
import { useAppState } from "@/state/app-state";
import { clearSession, getUser } from "@/lib/auth/session";
import { adminNav, teacherNav } from "@/components/SideNav";

export function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { state } = useAppState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const unread = state.notifications.filter((n) => !n.read).length;
  const user = getUser();
  const isAdmin = state.role === "admin";
  const nav = isAdmin ? adminNav : teacherNav;

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/60 backdrop-blur-2xl supports-[backdrop-filter]:bg-white/60">
      <div className="flex h-20 w-full items-center justify-between px-6 md:px-10">
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-black/5 bg-white text-black/70 shadow-sm transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] lg:hidden hover:scale-105 hover:bg-black/[0.02]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="h-5 w-5" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
          <Link href="/app/dashboard" className="group flex items-center gap-4 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5">
            <div className="relative h-12 w-12 overflow-hidden rounded-full border border-black/5 bg-white p-1.5 shadow-sm ring-1 ring-inset ring-black/5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-105">
              <Image
                src="/unicalretiana/favicon.png"
                alt="Uniclaretiana"
                fill
                className="object-contain"
                sizes="48px"
                priority
              />
            </div>
            <div className="leading-tight">
              <div className="text-[13px] font-bold tracking-[0.15em] text-black">
                UNICLARETIANA
              </div>
              <div className="hidden text-xs font-medium tracking-wide text-black/50 sm:block">INVENTARIO & PRÉSTAMOS</div>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/app/notificaciones"
            className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-black/5 bg-white text-black/70 shadow-sm transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:scale-105 hover:bg-black/[0.02] hover:shadow-md"
            aria-label="Notificaciones"
          >
            <IconBell className="h-5 w-5" />
            {unread > 0 ? (
              <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-uniclaretiana-yellow shadow-[0_0_8px_rgba(244,196,0,0.8)]" />
            ) : null}
          </Link>

          <button
            type="button"
            className="group inline-flex h-12 items-center gap-3 rounded-full border border-black/5 bg-white px-4 text-sm font-bold text-black/80 shadow-sm transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-black/[0.02] hover:shadow-md"
            aria-label="Perfil"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.04] text-black transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110">
              <IconUser className="h-4 w-4" />
            </span>
            <span className="hidden sm:block">{user?.name ?? "Usuario"}</span>
          </button>

          <button
            type="button"
            className="inline-flex h-12 items-center gap-3 rounded-full border border-black/5 bg-white px-4 text-sm font-bold text-black/70 shadow-sm transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-red-50 hover:text-red-600 hover:shadow-md"
            aria-label="Salir"
            onClick={() => {
              clearSession();
              router.push("/login");
            }}
          >
            <IconLogout className="h-5 w-5" />
            <span className="hidden sm:block">Salir</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="absolute left-0 top-16 w-full border-b border-black/10 bg-white p-4 shadow-lg lg:hidden animate-slide-up">
          <nav className="flex flex-col gap-2">
            {nav.map(({ href, label, Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              const isAction = href === "/app/solicitar";
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={
                    isAction && !active
                      ? "flex items-center gap-3 rounded-xl bg-uniclaretiana-yellow px-4 py-3 text-sm font-bold text-uniclaretiana-black"
                      : active
                        ? "flex items-center gap-3 rounded-xl bg-black/[0.04] px-4 py-3 text-sm font-semibold text-black"
                        : "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-black/70 hover:bg-black/[0.03]"
                  }
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
