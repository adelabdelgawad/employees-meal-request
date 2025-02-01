"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";

// ✅ Add proper TypeScript interface
interface User {
  id: string;
  username: string;
  fullName: string;
  title: string;
  roles: string[];
}

export default function UserAvatar() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // ✅ Add loading state and mount check
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ✅ Show nothing until mounted and session is loaded
  if (!isMounted || status === "loading") return null;
  if (!session?.user) return null;

  // ✅ Proper type narrowing instead of assertion
  const user = session.user as User;

  const getInitials = (name: string) => {
    const words = name.trim().split(" ");
    return words
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const initials = user.fullName
    ? getInitials(user.fullName)
    : user.username[0].toUpperCase();

  return (
    <div className="user-avatar-container absolute bottom-4 left-4 flex flex-col items-end">
      <button
        className="w-12 h-12 flex items-center justify-center bg-blue-600 text-white text-lg font-bold rounded-full shadow-lg border-2 border-gray-300 hover:bg-blue-700 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        aria-label="User menu"
      >
        {initials}
      </button>

      {isOpen && (
        <div className="absolute bottom-14 left-0 w-56 bg-white shadow-lg rounded-lg p-3 text-center border border-gray-200">
          <div className="mb-2">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user.fullName || "Unknown User"}
            </p>
            <p className="text-xs text-gray-500 mt-1">@{user.username}</p>
            {user.title && (
              <p className="text-xs text-gray-600 mt-1 truncate">
                {user.title}
              </p>
            )}
          </div>
          <hr className="my-2 border-gray-200" />
          <button
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
