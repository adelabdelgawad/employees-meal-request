// Define valid application roles as a type
export type AppRole = "Admin" | "User" | "Ordertaker" | "Manager";

// Define route configuration structure
export interface RouteConfig {
  path: string;
  roles: AppRole[];
  navSection?: string;
  navTitle?: string;
  navDescription?: string;
}

// Centralized route configuration
export const routesConfig: RouteConfig[] = [
  {
    path: "/request/new-request",
    roles: ["Admin", "User"],
    navSection: "Request",
    navTitle: "New Request",
    navDescription: "Create a new meal request.",
  },
  {
    path: "/request/requests",
    roles: ["Admin", "Ordertaker"],
    navSection: "Request",
    navTitle: "Requests",
    navDescription: "View and manage all submitted requests.",
  },
  {
    path: "/request/history",
    roles: ["Admin", "User"],
    navSection: "Request",
    navTitle: "History",
    navDescription: "View and manage your requests.",
  },
  {
    path: "/report/requests-dashboard",
    roles: ["Admin"],
    navSection: "Report",
    navTitle: "Requests Dashboard",
    navDescription: "Analyze requests with interactive dashboards.",
  },
  {
    path: "/report/details",
    roles: ["Admin"],
    navSection: "Report",
    navTitle: "Requests Details",
    navDescription: "Detailed breakdown of each request.",
  },
  {
    path: "/data-management/meal-plans",
    roles: ["Admin"],
    navSection: "Report",
    navTitle: "Meal Plans",
    navDescription: "Manage and organize meal plans.",
  },
  {
    path: "/setting/users",
    roles: ["Admin", "Manager"],
    navSection: "Settings",
    navTitle: "Users",
    navDescription: "Manage application users and their roles.",
  }
];

// Publicly accessible paths
export const publicPaths = [
  "/access-denied",
  "/login"
];