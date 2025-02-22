import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import UserAvatarServer from "./UserAvatarServer";
import { getSession } from "@/lib/session";

interface SidebarItem {
  title: string;
  url: string;
  role: string;
  icon: React.ElementType | null;
  description: string;
}

interface SidebarSection {
  title: string;
  role: string;
  icon: React.ElementType | null;
  items: SidebarItem[];
}

const components: SidebarSection[] = [
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
        description: "Create a new meal request.",
      },
      {
        title: "Requests",
        url: "/request/requests",
        role: "Admin, Ordertaker, User",
        icon: null,
        description: "View and manage all submitted requests.",
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
        description: "Analyze requests with interactive dashboards.",
      },
      {
        title: "Requests Details",
        url: "/report/details",
        role: "Admin",
        icon: null,
        description: "Detailed breakdown of each request.",
      },
      {
        title: "Meal Plans",
        url: "/data-management/meal-plans",
        role: "Admin",
        icon: null,
        description: "Manage and organize meal plans.",
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
        description: "Manage application users and their roles.",
      },
      {
        title: "Roles",
        url: "/security/roles",
        role: "Admin, Manager",
        icon: null,
        description: "Configure roles and permissions.",
      },
    ],
  },
];

/**
 * Checks if the user has at least one of the required roles.
 *
 * @param roleString - A comma-separated string of roles (e.g. "Admin, User").
 * @param userRoles - An array of roles from the session (e.g. ["User", "Admin"]).
 * @returns True if at least one required role exists in the user's roles.
 */
function hasPermission(roleString: string, userRoles: string[]): boolean {
  if (!roleString) return true;
  const requiredRoles = roleString.split(",").map((r) => r.trim().toLowerCase());
  const normalizedUserRoles = userRoles.map((role) => role.toLowerCase());
  return requiredRoles.some((role) => normalizedUserRoles.includes(role));
}

/* ListItem Component */
function ListItem({
  className = "",
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"a"> & { title: string; href: string }) {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          href={href}
          className={`block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${className}`}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
}

/**
 * NavigationBar component retrieves the current session to determine the user's roles
 * and filters navigation sections and items accordingly.
 *
 * @returns A navigation bar with menu items that the user has permission to view.
 */
export default async function NavigationBar() {
  // Retrieve the session (expects session.roles to be an array, e.g. ["User"])
  const session: Session | null =  await getSession();
  const userRoles: string[] = session?.user.roles || [];

  // Filter sections and their items based on the user's roles.
  const filteredComponents = components
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => hasPermission(item.role, userRoles)),
    }))
    .filter((section) => hasPermission(section.role, userRoles) && section.items.length > 0);

  return (
    <nav className="flex items-center justify-between h-20 px-6 shadow-md bg-white sticky top-0 z-50">
      {/* Left Side: Logo/Icon */}
      <div className="flex items-center space-x-2">
        <span className="text-xl font-bold">MyApp</span>
      </div>

      {/* Center: Navigation Menu */}
      <NavigationMenu>
        <NavigationMenuList>
          {filteredComponents.map((section) => (
            <NavigationMenuItem key={section.title}>
              <NavigationMenuTrigger>{section.title}</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[300px] gap-3 p-4 md:w-[400px]">
                  {section.items.map((item) => (
                    <ListItem key={item.url} title={item.title} href={item.url}>
                      {item.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </NavigationMenu>

      {/* Right Side: User Avatar */}
      <div>
        <UserAvatarServer />
      </div>
    </nav>
  );
}
