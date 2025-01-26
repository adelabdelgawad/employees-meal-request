"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MdAddBox,
  MdListAlt,
  MdDashboard,
  MdDescription,
  MdRestaurantMenu,
  MdPeople,
  MdSecurity,
} from "react-icons/md";
import { ChevronLeft } from "lucide-react";

const currentRole = "admin";

const data = {
  navMain: [
    {
      title: "Request",
      role: "admin, requester, approver",
      icon: MdListAlt,
      items: [
        {
          title: "New Request",
          url: "/request/new-request",
          role: "admin, requester",
          icon: MdAddBox,
        },
        {
          title: "Requests",
          url: "/request/requests",
          role: "admin, approver",
          icon: MdListAlt,
        },
      ],
    },
    {
      title: "Report",
      role: "admin",
      icon: MdDashboard,
      items: [
        {
          title: "Requests Dashboard",
          url: "/report/requests-dashboard",
          role: "admin",
          icon: MdDashboard,
        },
        {
          title: "Requests Details",
          url: "/report/details",
          role: "admin",
          icon: MdDescription,
        },
        {
          title: "Meal Plans",
          url: "/data-management/meal-plans",
          role: "admin",
          icon: MdRestaurantMenu,
        },
      ],
    },
    {
      title: "Settings",
      role: "admin, moderator",
      icon: MdSecurity,
      items: [
        {
          title: "Users",
          url: "/setting/users",
          role: "admin, moderator",
          icon: MdPeople,
        },
        {
          title: "Roles",
          url: "/security/roles",
          role: "admin, moderator",
          icon: MdSecurity,
        },
      ],
    },
  ],
};
const isRoleAllowed = (roles) => roles.split(", ").includes(currentRole);

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside
      className={`h-screen bg-gray-900 text-white flex flex-col ${
        isCollapsed ? "w-20" : "w-64"
      } transition-all duration-300`}
    >
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && <span className="text-xl font-semibold">Menu</span>}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-gray-700 transition"
        >
          <ChevronLeft
            className={`w-6 h-6 transform ${
              isCollapsed ? "rotate-180" : ""
            } transition-transform duration-300`}
          />
        </button>
      </div>
      <ul className="flex-1 space-y-2">
        {data.navMain
          .filter((section) => isRoleAllowed(section.role))
          .map((section) => (
            <li key={section.title}>
              <div className="flex items-center gap-4 p-2 hover:bg-gray-700 transition rounded-md">
                <section.icon className="w-6 h-6" />
                {!isCollapsed && <span>{section.title}</span>}
              </div>
              <ul className={`ml-4 space-y-1 ${isCollapsed ? "hidden" : ""}`}>
                {section.items
                  .filter((item) => isRoleAllowed(item.role))
                  .map((item) => (
                    <li key={item.title}>
                      <Link
                        href={item.url}
                        className="flex items-center gap-4 p-2 hover:bg-gray-700 transition rounded-md"
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </li>
          ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
