import { LucideIcon, FilePlus, List, History, BarChart, FileText, Users } from "lucide-react";

// Define valid application roles as a type
export type AppRole = "Admin" | "User" | "Ordertaker" | "Manager";

// Define route configuration structure
export interface RouteConfig {
  path: string;
  roles: AppRole[];
  navSection?: string;
  navTitle?: string;
  navDescription?: string;
  icon?: LucideIcon;
}

// Centralized route configuration
export const routesConfig: RouteConfig[] = [
  {
    path: "/request/new-request",
    roles: ["Admin", "User"],
    navSection: "Request",
    navTitle: "New Request",
    navDescription: "Create a new meal request.",
    icon: FilePlus,
  },
  {
    path: "/request/requests",
    roles: ["Admin", "Ordertaker"],
    navSection: "Request",
    navTitle: "Requests",
    navDescription: "View and manage all submitted requests.",
    icon: List,
  },
  {
    path: "/request/history",
    roles: ["Admin", "User"],
    navSection: "Request",
    navTitle: "History",
    navDescription: "View and manage your requests.",
    icon: History,
  },
  {
    path: "/report/requests-dashboard",
    roles: ["Admin"],
    navSection: "Report",
    navTitle: "Requests Dashboard",
    navDescription: "Analyze requests with interactive dashboards.",
    icon: BarChart,
  },
  {
    path: "/report/details",
    roles: ["Admin"],
    navSection: "Report",
    navTitle: "Requests Details",
    navDescription: "Detailed breakdown of each request.",
    icon: FileText,
  },
  {
    path: "/setting/users",
    roles: ["Admin", "Manager"],
    navSection: "Settings",
    navTitle: "Users",
    navDescription: "Manage application users and their roles.",
    icon: Users,
  },
  {
    path: "/setting/meals",
    roles: ["Admin", "Manager"],
    navSection: "Settings",
    navTitle: "Meals",
    navDescription: "Manage available meals and their details.",
    icon: FileText, // Revised entry
  },
];

// Publicly accessible paths
export const publicPaths = ["/access-denied", "/login"];