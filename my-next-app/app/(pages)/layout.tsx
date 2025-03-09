import NavigationBar from "@/components/NavigationBar";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  console.log("J")
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 antialiased">
      <NavigationBar /> {/* Server Component */}
      <div className="flex-1 p-4">{children}</div>
      <Toaster position="bottom-center" />
    </div>
  );
}
