"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { getSession } from "@/lib/session";
import { routesConfig, RouteConfig, AppRole } from "@/config/accessConfig";

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [navSections, setNavSections] = useState<RouteConfig[]>([]);

  useEffect(() => {
    const fetchSession = async () => {
      const session = await getSession();
      const userRoles = (session?.user?.roles || []) as AppRole[];

      // Filter routes based on user roles
      const filteredRoutes = routesConfig.filter(route =>
        route.roles.some(role => userRoles.includes(role))
      );

      setNavSections(filteredRoutes);
    };

    fetchSession();
  }, []);

  return (
    <TooltipProvider>
      <>
        <button
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-background rounded-md shadow-md"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div
          className={cn(
            "fixed inset-y-0 z-20 flex flex-col bg-background transition-all duration-300 ease-in-out lg:static",
            isCollapsed ? "w-[72px]" : "w-72",
            isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
        >
          <div className="border-b border-border">
            <div className={cn("flex h-16 items-center gap-2 px-4", isCollapsed && "justify-center px-2")}>
              {!isCollapsed && (
                <Link href="/" className="flex items-center font-semibold">
                  <span className="text-lg">MyApp</span>
                </Link>
              )}
              <div
                className="cursor-pointer"
                onClick={() => setIsCollapsed(!isCollapsed)}
                aria-label="Toggle sidebar"
              >
                <ChevronLeft className={cn("h-5 w-5 transition-transform", isCollapsed && "rotate-180")} />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <nav className="space-y-1 px-2 py-4">
              {navSections.map(item => {
                const IconComponent = item.icon;
                return (
                  <Tooltip key={item.path} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Link
                        href={item.path}
                        className={cn(
                          "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                          pathname === item.path
                            ? "bg-secondary text-secondary-foreground"
                            : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
                          isCollapsed && "justify-center px-2"
                        )}
                      >
                        {IconComponent && <IconComponent className={cn("h-4 w-4", !isCollapsed && "mr-3")} />}
                        {!isCollapsed && <span>{item.navTitle}</span>}
                      </Link>
                    </TooltipTrigger>
                    {isCollapsed && (
                      <TooltipContent side="right" className="flex items-center gap-4">
                        {item.navTitle}
                      </TooltipContent>
                    )}
                  </Tooltip>
                );
              })}
            </nav>
          </div>
        </div>
      </>
    </TooltipProvider>
  );
}
