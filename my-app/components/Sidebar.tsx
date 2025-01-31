import { auth } from "@/auth";
import Link from "next/link";
import UserAvatar from "./UserAvatar";

// ✅ Define TypeScript types for sidebar structure
interface SidebarItem {
  title: string;
  url: string;
  role: string; // Role as a comma-separated string (e.g., "Admin, User")
  icon: React.ElementType | null;
}

interface SidebarSection {
  title: string;
  role: string; // Role as a comma-separated string
  icon: React.ElementType | null;
  items: SidebarItem[];
}

// ✅ Define the sidebar menu data
const sidebarData: SidebarSection[] = [
  {
    title: "Request",
    role: "Admin, User, Ordertaker",
    icon: null,
    items: [
      {
        title: "New Request",
        url: "/request/new-request",
        role: "Admin, User",
        icon: null,
      },
      {
        title: "Requests",
        url: "/request/requests",
        role: "Admin, Ordertaker",
        icon: null,
      },
    ],
  },
  {
    title: "Report",
    role: "Admin",
    icon: null,
    items: [
      {
        title: "Requests Dashboard",
        url: "/report/requests-dashboard",
        role: "Admin",
        icon: null,
      },
      {
        title: "Requests Details",
        url: "/report/details",
        role: "Admin",
        icon: null,
      },
      {
        title: "Meal Plans",
        url: "/data-management/meal-plans",
        role: "Admin",
        icon: null,
      },
    ],
  },
  {
    title: "Settings",
    role: "Admin, Manager",
    icon: null,
    items: [
      {
        title: "Users",
        url: "/setting/users",
        role: "Admin, Manager",
        icon: null,
      },
      {
        title: "Roles",
        url: "/security/roles",
        role: "Admin, Manager",
        icon: null,
      },
    ],
  },
];

// ✅ Define TypeScript type for user session
interface UserSession {
  userId: number;
  username: string;
  fullName: string;
  userTitle: string;
  userRoles: string[];
}

export default async function Sidebar() {
  // ✅ Fetch session safely
  const session = await auth();
  const userRoles: string[] = session?.user?.userRoles ?? [];

  // ✅ Ensure roles are properly formatted as an array
  const normalizeRoles = (roles: string): string[] =>
    roles.split(",").map((role) => role.trim());

  // ✅ Function to check if user has permission for a section or item
  const isRoleAllowed = (allowedRoles: string): boolean => {
    const allowedRolesArray = normalizeRoles(allowedRoles);
    return userRoles.some((role) => allowedRolesArray.includes(role));
  };

  return (
    <aside className="h-screen bg-gray-100 border-r flex flex-col relative">
      {/* Sidebar Header */}
      <div className="flex flex-col items-start p-4 border-b">
        <h2 className="text-lg font-bold">Employee Meal Request</h2>
        <h2 className="text-sm text-gray-600">Version 1.0</h2>
      </div>

      {/* Dynamic Sidebar Menu */}
      <ul className="space-y-2 mt-4">
        {sidebarData
          .filter((section) => isRoleAllowed(section.role))
          .map((section) => (
            <li key={section.title}>
              <div className="flex items-center justify-between p-2 hover:bg-gray-200 transition rounded-md">
                <div className="flex items-center gap-4">
                  {section.icon && (
                    <section.icon className="w-5 h-5 text-gray-600" />
                  )}
                  <span className="text-gray-700 font-semibold">
                    {section.title}
                  </span>
                </div>
              </div>

              {/* Section Items */}
              <ul className="ml-8 space-y-2">
                {section.items
                  .filter((item) => isRoleAllowed(item.role))
                  .map((item) => (
                    <li key={item.title}>
                      <Link
                        href={item.url}
                        className="flex items-center gap-2 p-1 hover:bg-gray-200 transition rounded-md"
                      >
                        <span className="text-gray-700">{item.title}</span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </li>
          ))}
      </ul>

      {/* Avatar at Bottom */}
      <UserAvatar />
    </aside>
  );
}
