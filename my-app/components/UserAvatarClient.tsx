"use client";

import { logout } from "@/lib/session";
import { useEffect, useState } from "react";

/**
 * Props for the UserAvatarClient component.
 */
interface UserAvatarClientProps {
  session: Session | null;
}

export default function UserAvatarClient({ session }: UserAvatarClientProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Return nothing until the component is mounted or session is missing.
  if (!session?.user.userId) return null;

  /**
   * Returns the initials of a given name.
   *
   * @param {string} name - The full name.
   * @returns {string} The uppercase initials.
   */
  const getInitials = (name: string) => {
    const words = name.trim().split(" ");
    return words
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const initials = session.user.fullName
    ? getInitials(session.user.fullName)
    : session.user.username?.[0].toUpperCase() || "";

  return (
    <div className="user-avatar-container relative flex flex-col items-start">
      <div className="relative">
        <button
          className="w-12 h-12 flex items-center justify-center bg-blue-600 text-white text-lg font-bold rounded-full shadow-md border border-gray-300 hover:bg-blue-700 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          aria-label="User menu"
        >
          {initials}
        </button>

        {isOpen && (
          <div className="absolute bottom-full left-0 mb-2 w-64 bg-white shadow-xl rounded-lg p-4 border border-gray-200 z-20 transition ease-out duration-150">
            {/* Dropdown arrow pointing toward the avatar */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
              <div className="w-3 h-3 bg-white border-b border-r border-gray-200 rotate-45"></div>
            </div>
            <div className="mb-2">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {session.user.fullName || "Unknown User"}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                @{session.user.username}
              </p>
              {session.user.title && (
                <p className="text-xs text-gray-600 mt-1 truncate">
                  {session.user.title}
                </p>
              )}
            </div>
            <hr className="my-3 border-gray-200" />
            <button
              onClick={() => logout()}
              className="w-full py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
