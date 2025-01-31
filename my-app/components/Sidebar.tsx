import { auth } from "@/auth";
import Link from "next/link";
import UserAvatar from "./UserAvatar";

// Sidebar Data
const data = {
  navMain: [
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
  ],
};

export default async function Sidebar() {
  // Fetch session on the server
  const session = await auth();
  const userRoles = session?.user?.userRoles || [];

  // Function to check if a user role is allowed
  const isRoleAllowed = (allowedRoles: string) => {
    const allowedRolesArray = allowedRoles
      .split(", ")
      .map((role) => role.trim());
    return userRoles.some((role) => allowedRolesArray.includes(role));
  };

  return (
    <aside className="h-screen bg-gray-100 border-r flex flex-col relative">
      {" "}
      {/* Sidebar Header */}
      <div className="flex flex-col items-start  p-4 border-b">
        <h2 className="text-lg font-bold">Employee Meal Request</h2>
        <h2 className="text-s ">Version 1.0</h2>
      </div>
      {/* Dynamic Sidebar Menu */}
      <ul className="space-y-2 mt-4">
        {data.navMain
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
