"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LayoutGrid } from "lucide-react";
import { routesConfig, AppRole } from "@/config/accessConfig";
import UserAvatarClient from "./UserAvatarClient";

interface SidebarProps {
  user: User
  userRoles: AppRole[];
}

export default function Sidebar({ user, userRoles }: SidebarProps) {
  const pathname = usePathname();

  // Compute navigation items directly using props (no useEffect needed)
  const navItems = routesConfig
    .filter((route) => route.roles.some((role) => userRoles.includes(role)))
    .map((route) => ({
      title: route.navTitle || "Untitled",
      path: route.path,
      icon: route.icon || LayoutGrid, // Default icon if not provided
    }));

  return (
    
    <div className="flex h-screen bg-background">
      {/* Sidebar Container */}
      <div className="flex w-64 flex-col border-r bg-muted/10">
        {/* Sidebar Header */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-primary" />
            <span className="font-semibold">Employees Meal Request</span>
          </div>
        </div>
        {/* Scrollable Navigation */}
        <ScrollArea className="flex-1 p-4">
          <nav className="flex flex-col space-y-4">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={pathname === item.path ? 'default' : 'ghost'}
                  className="w-full justify-start"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Button>
              </Link>
            ))}
          </nav>
        </ScrollArea>
        {/* User Avatar at the Bottom */}
        <div className="p-4 border-t">
          <UserAvatarClient user={user} />
        </div>
      </div>
      {/* Main Content Area */}
      <div className="flex-1">
        {/* Your main content goes here */}
      </div>
    </div>
  );
}
