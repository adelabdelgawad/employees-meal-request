"use client";

import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import Link from "next/link";

const currentRole = "admin";

const data = {
  navMain: [
    {
      title: "Request",
      role: "admin, requester, approver",
      items: [
        {
          title: "New Request",
          url: "/request/new-request",
          role: "admin, requester",
        },
        {
          title: "Requests",
          url: "/request/requests",
          role: "admin, approver",
        },
        { title: "History", url: "/request/history", role: "admin, requester" },
      ],
    },
    {
      title: "Data Management",
      role: "admin",
      items: [
        {
          title: "Allergies",
          url: "/data-management/allergies",
          role: "admin",
        },
        { title: "Meals", url: "/data-management/meals", role: "admin" },
        {
          title: "Meal Plans",
          url: "/data-management/meal-plans",
          role: "admin",
        },
        {
          title: "Nutrition",
          url: "/data-management/nutrition",
          role: "admin",
        },
      ],
    },
    {
      title: "Security",
      role: "admin, moderator",
      items: [
        {
          title: "Permission",
          url: "/security/permissions",
          role: "admin, moderator",
        },
        { title: "Users", url: "/security/users", role: "admin, moderator" },
        { title: "Roles", url: "/security/roles", role: "admin, moderator" },
      ],
    },
  ],
};

export function AppSidebar() {
  const isRoleAllowed = (roles: string) => {
    return roles.split(", ").includes(currentRole);
  };

  return (
    <NavigationMenu.Root className="bg-gray-900 text-white w-64 h-full p-4">
      <NavigationMenu.List>
        {data.navMain
          .filter((item) => isRoleAllowed(item.role))
          .map((item) => (
            <NavigationMenu.Item key={item.title} className="mb-4">
              <NavigationMenu.Trigger className="font-bold text-lg mb-2">
                {item.title}
              </NavigationMenu.Trigger>
              <NavigationMenu.Content className="pl-4">
                <ul>
                  {item.items
                    .filter((subItem) => isRoleAllowed(subItem.role))
                    .map((subItem) => (
                      <li key={subItem.title}>
                        <Link href={subItem.url}>
                          <a className="block p-2 hover:bg-gray-700 rounded">
                            {subItem.title}
                          </a>
                        </Link>
                      </li>
                    ))}
                </ul>
              </NavigationMenu.Content>
            </NavigationMenu.Item>
          ))}
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
}
