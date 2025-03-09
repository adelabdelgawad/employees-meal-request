import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import UserAvatarServer from "./UserAvatarServer";
import { getSession } from "@/lib/session";
import { AppRole, routesConfig } from "@/config/accessConfig";
      
interface NavSection {
  title: string;
  items: {
    title: string;
    url: string;
    description: string;
  }[];
}

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

export default async function NavigationBar() {
  const session = await getSession();
  const userRoles = (session?.user?.roles || []) as AppRole[];

  // Group routes into navigation sections
  const navSections = routesConfig.reduce((acc, route) => {
    // Skip routes without navigation metadata or missing permissions
    if (
      !route.navSection ||
      !route.navTitle ||
      !route.roles.some(role => userRoles.includes(role))
    ) {
      return acc;
    }

    const existingSection = acc.find(s => s.title === route.navSection);
    const navItem = {
      title: route.navTitle,
      url: route.path,
      description: route.navDescription || ""
    };

    if (existingSection) {
      existingSection.items.push(navItem);
    } else {
      acc.push({
        title: route.navSection,
        items: [navItem]
      });
    }
    return acc;
  }, [] as NavSection[]);

  return (
    <nav className="flex items-center justify-between h-20 px-6 shadow-md bg-white sticky top-0 z-50">
      {/* Left Side: Logo/Icon */}
      <div className="flex items-center space-x-2">
      </div>

      {/* Center: Navigation Menu */}
      <NavigationMenu>
        <NavigationMenuList>
          {navSections.map((section) => (
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