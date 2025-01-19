'use client';

import Link from 'next/link';
import { useSidebar } from '@/hooks/SidebarContext';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';

const currentRole = 'admin';

const data = {
  navMain: [
    {
      title: 'Request',
      role: 'admin, requester, approver',
      items: [
        {
          title: 'New Request',
          url: '/request/new-request',
          role: 'admin, requester',
        },
        {
          title: 'Requests',
          url: '/request/requests',
          role: 'admin, approver',
        },
      ],
    },
    {
      title: 'Report',
      role: 'admin',
      items: [
        {
          title: 'Requests Dashboard',
          url: '/report/requests-dashboard',
          role: 'admin',
        },
        {
          title: 'Requests  Details',
          url: '/report/details',
          role: 'admin',
        },
        {
          title: 'Meal Plans',
          url: '/data-management/meal-plans',
          role: 'admin',
        },
      ],
    },
    {
      title: 'Settings',
      role: 'admin, moderator',
      items: [
        { title: 'Users', url: '/setting/users', role: 'admin, moderator' },
        { title: 'Roles', url: '/security/roles', role: 'admin, moderator' },
      ],
    },
  ],
};

const isRoleAllowed = (roles: string) =>
  roles.split(', ').includes(currentRole);

export const Sidebar = () => {
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  return (
    <aside
      className={`bg-gray-900 text-white h-full p-4 fixed top-0 left-0 transform ${
        isSidebarOpen ? 'w-64' : 'w-16'
      } transition-all duration-300`}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="bg-gray-800 text-white p-2 rounded mb-4 flex items-center justify-center"
      >
        {isSidebarOpen ? (
          <ChevronLeftIcon className="w-6 h-6" />
        ) : (
          <ChevronRightIcon className="w-6 h-6" />
        )}
      </button>

      {/* Navigation */}
      <ul className="space-y-4">
        {data.navMain
          .filter((item) => isRoleAllowed(item.role))
          .map((item) => (
            <li key={item.title}>
              <h2
                className={`font-bold text-lg mb-2 ${
                  isSidebarOpen ? 'block' : 'hidden'
                }`}
              >
                {item.title}
              </h2>
              <ul className="pl-4 space-y-2">
                {item.items
                  .filter((subItem) => isRoleAllowed(subItem.role))
                  .map((subItem) => (
                    <li key={subItem.title} className="flex items-center">
                      <Link
                        href={subItem.url}
                        className="p-2 hover:bg-gray-700 rounded flex items-center"
                      >
                        <span
                          className={`${
                            isSidebarOpen ? 'block' : 'hidden'
                          } ml-2`}
                        >
                          {subItem.title}
                        </span>
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
