import * as React from "react";
import Link from "next/link";
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

// Mock the current logged-in role (Replace this with your auth logic)
const currentRole = "admin";

const data = {
  navMain: [
    {
      title: "Request",
      url: "#",
      role: "admin, requester, approver",
      headerTitle: "Request Section",
      items: [
        {
          title: "New Request",
          url: "/request/new-request",
          role: "admin, requester",
          headerTitle: "Create a New Request",
          isActive: false,
        },
        {
          title: "Request List",
          url: "/request/request-list",
          role: "admin, approver",
          headerTitle: "View Request List",
          isActive: false,
        },
        {
          title: "History",
          url: "/request/history",
          role: "admin, requester",
          headerTitle: "Request History",
          isActive: false,
        },
      ],
    },
    {
      title: "Data Management",
      url: "/data-management",
      role: "admin",
      headerTitle: "Data Management",
      items: [
        {
          title: "Allergies",
          url: "/data-management/allergies",
          role: "admin",
          headerTitle: "Manage Allergies",
          isActive: false,
        },
        {
          title: "Meals",
          url: "/data-management/meals",
          role: "admin",
          headerTitle: "Manage Meals",
          isActive: true,
        },
        {
          title: "Meal Plans",
          url: "/data-management/meal-plans",
          role: "admin",
          headerTitle: "Manage Meal Plans",
          isActive: false,
        },
        {
          title: "Nutrition",
          url: "/data-management/nutrition",
          role: "admin",
          headerTitle: "Manage Nutrition",
          isActive: false,
        },
      ],
    },
    {
      title: "Security",
      url: "/security",
      role: "admin, moderator",
      headerTitle: "Security Management",
      items: [
        {
          title: "Permission",
          url: "/security/permissions",
          role: "admin, moderator",
          headerTitle: "Manage Permissions",
          isActive: false,
        },
        {
          title: "Users",
          url: "/security/users",
          role: "admin, moderator",
          headerTitle: "Manage Users",
          isActive: false,
        },
        {
          title: "Roles",
          url: "/security/roles",
          role: "admin, moderator",
          headerTitle: "Manage Roles",
          isActive: false,
        },
      ],
    },
  ],
};

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  // Helper function to check if the current role is allowed
  const isRoleAllowed = (roles: string) => {
    return roles.split(", ").includes(currentRole);
  };

  return (
    <Sidebar {...props}>
      <SidebarContent className="p-1">
        {data.navMain
          .filter((item) => isRoleAllowed(item.role))
          .map((item) => (
            <SidebarGroup key={item.title}>
              <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {item.items
                    .filter((subItem) => isRoleAllowed(subItem.role))
                    .map((subItem) => (
                      <SidebarMenuItem key={subItem.title}>
                        <Link href={subItem.url} passHref>
                          <SidebarMenuButton
                            asChild
                            isActive={subItem.isActive}
                          >
                            <span>{subItem.title}</span>
                          </SidebarMenuButton>
                        </Link>
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
