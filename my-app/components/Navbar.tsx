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
import UserAvatar from "@/components/UserAvatar";

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
        role: "Admin, Ordertaker",
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

export default function NavigationBar() {
  return (
    <nav className="flex items-center justify-between h-20 px-6 shadow-md bg-white sticky top-0 z-50">
      {/* Left Side: Logo/Icon */}
      <div className="flex items-center space-x-2">
        <span className="text-xl font-bold">MyApp</span>
      </div>

      {/* Center: Navigation Menu */}
      <NavigationMenu>
        <NavigationMenuList>
          {components.map((section) => (
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

          <NavigationMenuItem>
            <Link href="/docs" legacyBehavior passHref>
              <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                Documentation
              </NavigationMenuLink>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      {/* Right Side: Login Button */}
      <div>
        <UserAvatar />
      </div>
    </nav>
  );
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
