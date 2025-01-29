"use client";

import Sidebar from "@/components/Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <div className="flex">
        {/* Sidebar */}
        <div className="h-screen">
          <Sidebar />
        </div>
        {/* Page Content */}
        <main className="flex-grow p-4">{children}</main>
      </div>
    </main>
  );
}
