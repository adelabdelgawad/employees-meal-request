// app/layout.js
import Sidebar from "@/components/Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <div className="flex">
        <div className="flex h-screen">
          <Sidebar />
        </div>
        <main className="flex-grow">{children}</main>
      </div>
    </main>
  );
}
