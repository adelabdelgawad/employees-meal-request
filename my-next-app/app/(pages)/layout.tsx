import Sidebar from "@/components/new";
import { getSession } from "@/lib/session";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { AppRole } from "@/config/accessConfig";

interface RootLayoutProps {
  children: ReactNode;
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const session = await getSession();
  const userRoles = (session?.user?.roles || []) as AppRole[];
  return (
    <div className="min-h-screen flex  bg-gray-50 text-gray-900 antialiased">
      <Sidebar userRoles={userRoles}/> {/* Server Component */}
      <div className="flex-1 p-0">{children}</div>
      <Toaster position="bottom-center" />
    </div>
  );
}
