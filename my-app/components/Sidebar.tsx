"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FaBars } from "react-icons/fa";

const data = {
  navMain: [
    {
      title: "Request",
      role: "admin, requester, approver",
      icon: null,
      items: [
        {
          title: "New Request",
          url: "/request/new-request",
          role: "admin, requester",
          icon: null,
        },
        {
          title: "Requests",
          url: "/request/requests",
          role: "admin, approver",
          icon: null,
        },
      ],
    },
    {
      title: "Report",
      role: "admin",
      icon: null,
      items: [
        {
          title: "Requests Dashboard",
          url: "/report/requests-dashboard",
          role: "admin",
          icon: null,
        },
        {
          title: "Requests Details",
          url: "/report/details",
          role: "admin",
          icon: null,
        },
        {
          title: "Meal Plans",
          url: "/data-management/meal-plans",
          role: "admin",
          icon: null,
        },
      ],
    },
    {
      title: "Settings",
      role: "admin, moderator",
      icon: null,
      items: [
        {
          title: "Users",
          url: "/setting/users",
          role: "admin, moderator",
          icon: null,
        },
        {
          title: "Roles",
          url: "/security/roles",
          role: "admin, moderator",
          icon: null,
        },
      ],
    },
  ],
};

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        const session = await response.json();
        if (session?.user?.userRoles) {
          setUserRoles(session.user.userRoles);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Function to check if the user's roles match the required roles
  const isRoleAllowed = (allowedRoles: string) => {
    if (!userRoles.length) return false;
    const allowedRolesArray = allowedRoles
      .split(", ")
      .map((role) => role.trim());
    return userRoles.some((role) => allowedRolesArray.includes(role));
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <aside
      className={`h-screen bg-gray-100 border-r transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-md hover:bg-gray-100 transition"
        >
          {/* Menu Toggle Icon */}
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
                  {section.icon && (
                    <section.icon className="w-5 h-5 text-gray-600" />
                  )}
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
                          className="flex items-center gap-2 p-1 hover:bg-gray-200 transition rounded-md"
                        >
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
