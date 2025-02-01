import Sidebar from "@/components/Sidebar";
import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <Sidebar />
      </div>

      {/* Page Content */}
      <div className="flex-grow overflow-auto">
        <div className="min-w-full"> {children}</div>
      </div>
    </div>
  );
};

export default Layout;
