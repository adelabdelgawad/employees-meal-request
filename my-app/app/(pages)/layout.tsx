"use client";

import { SidebarProvider, useSidebar } from "@/hooks/SidebarContext";
import { Sidebar } from "@/components/Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar />
        {/* Main Content */}
        <Main>{children}</Main>
      </div>
    </SidebarProvider>
  );
}

const Main = ({ children }: { children: React.ReactNode }) => {
  const { isSidebarOpen } = useSidebar();

  return (
    <main
      className={`flex-1 overflow-auto transition-all duration-300 ${
        isSidebarOpen ? "ml-64" : "ml-16"
      }`}
    >
      {children}
    </main>
  );
};
