import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  navMain: [
    {
      title: "Request",
      url: "#",
      role: "admin, requester, approver, admin",
      items: [
        {
          title: "New Request",
          url: "request/new-request",
          role: "admin, requester",
          isActive: false,
        },
        {
          title: "Request List",
          url: "request/request-list",
          role: "admin, approver",
          isActive: false,
        },
        {
          title: "History",
          url: "request/history",
          role: "admin, requester",
          isActive: false,
        },
      ],
    },
    {
      title: "Data Management",
      url: "data-management",
      role: "admin, admin",
      items: [
        {
          title: "Allergies",
          url: "data-management/allergies",
          role: "admin, admin",
          isActive: false,
        },
        {
          title: "Meals",
          url: "data-management/meals",
          role: "admin, admin",
          isActive: true,
        },
        {
          title: "Meal Plans",
          url: "data-management/meal-plans",
          role: "admin, admin",
          isActive: false,
        },
        {
          title: "Nutration",
          url: "data-management/nutrations",
          role: "admin, admin",
          isActive: false,
        },
      ],
    },
    {
      title: "Security",
      url: "security",
      role: "admin, moderator",
      items: [
        {
          title: "Permission",
          url: "security/permissions",
          role: "admin, moderator",
          isActive: false,
        },
        {
          title: "Users",
          url: "security/users",
          role: "admin, moderator",
          isActive: false,
        },
        {
          title: "Roles",
          url: "security/roles",
          role: "admin, moderator",
          isActive: false,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const version = process.env.VERSION ? process.env.VERSION : "BETA-VERSION";
  const appName = process.env.APP_NAME ? process.env.APP_NAME : "APPLICATION";

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="flex flex-col items-center justify-center h-20">
          <div className="text-xl font-semibold text-gray-800">{appName}</div>
          <div className="text-sm font-medium text-gray-600">
            Version: <span className="text-gray-900">{version}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-1">
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.isActive}>
                      <a href={item.url}>{item.title}</a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
