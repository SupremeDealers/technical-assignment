import type { ReactNode } from "react";
import { AppHeader } from "./AppHeader";

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <AppHeader />
      <main className="containe max-w-screen-2xl px-4 py-6">{children}</main>
    </div>
  );
}
