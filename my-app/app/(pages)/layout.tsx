import NavigationBar from "@/components/NavigationBar";
import { ReactNode } from "react";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 antialiased">
      <NavigationBar /> {/* Server Component */}
      <div className="flex-1 p-4">{children}</div>
    </div>
  );
}
