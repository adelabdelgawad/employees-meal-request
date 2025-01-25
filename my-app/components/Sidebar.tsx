// components/Sidebar.js
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
      ],
    },
    {
      title: "Report",
      role: "admin",
      items: [
        {
          title: "Requests Dashboard",
          url: "/report/requests-dashboard",
          role: "admin",
        },
        { title: "Requests Details", url: "/report/details", role: "admin" },
        {
          title: "Meal Plans",
          url: "/data-management/meal-plans",
          role: "admin",
        },
      ],
    },
    {
      title: "Settings",
      role: "admin, moderator",
      items: [
        { title: "Users", url: "/setting/users", role: "admin, moderator" },
        { title: "Roles", url: "/security/roles", role: "admin, moderator" },
      ],
    },
  ],
};

const isRoleAllowed = (roles) => roles.split(", ").includes(currentRole);

const Sidebar = () => {
  return (
    <aside className="bg-gray-900 text-white h-full p-4">
      <ul className="space-y-4">
        {data.navMain
          .filter((item) => isRoleAllowed(item.role))
          .map((item) => (
            <li key={item.title}>
              <h2 className="font-bold text-lg mb-2">{item.title}</h2>
              <ul className="pl-4 space-y-2">
                {item.items
                  .filter((subItem) => isRoleAllowed(subItem.role))
                  .map((subItem) => (
                    <li key={subItem.title}>
                      <Link
                        href={subItem.url}
                        className="p-2 hover:bg-gray-700 rounded block"
                      >
                        {subItem.title}
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
