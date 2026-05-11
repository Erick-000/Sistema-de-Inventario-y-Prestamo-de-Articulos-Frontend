import { ReactNode } from "react";
import { SideNav } from "@/components/SideNav";
import { Topbar } from "@/components/Topbar";
import { AppStateProvider } from "@/state/app-state";
import { AuthGate } from "@/components/AuthGate";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <AppStateProvider>
        <div className="flex min-h-full flex-col bg-[radial-gradient(1200px_500px_at_20%_-10%,rgba(244,196,0,0.10),transparent_55%)]">
          <Topbar />
          <div className="flex w-full flex-1">
            <SideNav />
            <main className="flex-1 px-6 py-10 md:px-10 lg:px-12 xl:px-16">{children}</main>
          </div>
        </div>
      </AppStateProvider>
    </AuthGate>
  );
}
