"use client";

import { useState } from "react";
import Link from "next/link";
import { IconType } from "react-icons";
import {
  FaTasks,
  FaPlusSquare,
  FaClipboardList,
  FaChartPie,
  FaTachometerAlt,
  FaFileAlt,
  FaUtensils,
  FaCogs,
  FaUsers,
  FaUserShield,
  FaTools,
  FaBars,
} from "react-icons/fa";

const data = {
  navMain: [
    {
      title: "Request",
      role: "admin, requester, approver",
      icon: FaTasks,
      items: [
        {
          title: "New Request",
          url: "/request/new-request",
          role: "admin, requester",
          icon: FaPlusSquare,
        },
        {
          title: "Requests",
          url: "/request/requests",
          role: "admin, approver",
          icon: FaClipboardList,
        },
      ],
    },
    {
      title: "Report",
      role: "admin",
      icon: FaChartPie,
      items: [
        {
          title: "Requests Dashboard",
          url: "/report/requests-dashboard",
          role: "admin",
          icon: FaTachometerAlt,
        },
        {
          title: "Requests Details",
          url: "/report/details",
          role: "admin",
          icon: FaFileAlt,
        },
        {
          title: "Meal Plans",
          url: "/data-management/meal-plans",
          role: "admin",
          icon: FaUtensils,
        },
      ],
    },
    {
      title: "Settings",
      role: "admin, moderator",
      icon: FaCogs,
      items: [
        {
          title: "Users",
          url: "/setting/users",
          role: "admin, moderator",
          icon: FaUsers,
        },
        {
          title: "Roles",
          url: "/security/roles",
          role: "admin, moderator",
          icon: FaUserShield,
        },
      ],
    },
  ],
};

const currentRole = "admin"; // Current user's role

// Helper function to check role permissions
const isRoleAllowed = (roles: string) =>
  roles.split(", ").includes(currentRole);

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>(
    {}
  );

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <aside
      className={`h-screen bg-gray-100 border-r transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!isCollapsed && (
          <span className="text-xl font-bold text-gray-700">Menu</span>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-gray-200 transition"
        >
          <FaBars
            className={`w-6 h-6 transform ${
              isCollapsed ? "rotate-180" : ""
            } transition-transform duration-300`}
          />
        </button>
      </div>

      {/* Dynamic Sidebar Menu */}
      <ul className="space-y-2 mt-4">
        {data.navMain
          .filter((section) => isRoleAllowed(section.role))
          .map((section) => (
            <li key={section.title}>
              {/* Section Header */}
              <div
                onClick={() => toggleSection(section.title)}
                className="flex items-center justify-between p-2 hover:bg-gray-200 transition rounded-md cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <section.icon className="w-5 h-5 text-gray-600" />
                  {!isCollapsed && (
                    <span className="text-gray-700 font-semibold">
                      {section.title}
                    </span>
                  )}
                </div>
                {!isCollapsed && section.items.length > 0 && (
                  <span className="text-gray-500">
                    {openSections[section.title] ? "▲" : "▼"}
                  </span>
                )}
              </div>

              {/* Section Items */}
              {openSections[section.title] && !isCollapsed && (
                <ul className="ml-8 space-y-2">
                  {section.items
                    .filter((item) => isRoleAllowed(item.role))
                    .map((item) => (
                      <li key={item.title}>
                        <Link
                          href={item.url}
                          className="flex items-center gap-4 p-2 hover:bg-gray-200 transition rounded-md"
                        >
                          <item.icon className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">{item.title}</span>
                        </Link>
                      </li>
                    ))}
                </ul>
              )}
            </li>
          ))}
      </ul>
    </aside>
  );
};

export default Sidebar;
