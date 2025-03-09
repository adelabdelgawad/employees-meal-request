import NavigationBar from "@/components/NavigationBar";
import { ReactNode } from "react";

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  console.log("HSS")
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 antialiased">
      <NavigationBar /> 
      <div className="flex-1 p-4">{children}</div>
    </div>
  );
}
