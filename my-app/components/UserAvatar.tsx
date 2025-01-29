"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";

interface User {
  username: string;
  fullName: string;
  userTitle: string;
}

export default function UserAvatar() {
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        const session = await response.json();
        if (session?.user) {
          setUser({
            username: session.user.username,
            fullName: session.user.fullName,
            userTitle: session.user.userTitle,
          });
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      }
    };

    fetchSession();
  }, []);

  if (!user) return null; // Hide avatar if no user is found

  // Generate initials from full name
  const getInitials = (name: string) => {
    const words = name.trim().split(" ");
    if (words.length > 1) {
      return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase(); // First & Last word initials
    }
    return words[0][0].toUpperCase(); // Single name case
  };

  return (
    <div className="absolute bottom-4 left-4 flex flex-col items-end">
      {/* Avatar Icon with Initials */}
      <button
        className="w-12 h-12 flex items-center justify-center bg-blue-600 text-white text-lg font-bold rounded-full shadow-lg border-2 border-gray-300"
        onClick={() => setIsOpen(!isOpen)}
      >
        {getInitials(user.fullName)}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-14 left-0 w-56 bg-white shadow-md rounded-lg p-3 text-center border">
          <p className="text-sm font-bold text-gray-900">{user.fullName}</p>
          <p className="text-xs text-gray-500">@{user.username}</p>
          <p className="text-xs text-gray-600 mt-1">{user.userTitle}</p>
          <hr className="my-2" />
          <button
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-100 rounded-md"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
