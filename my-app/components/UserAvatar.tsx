"use client";

import { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";

// ✅ Define TypeScript types for user data

export default function UserAvatar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  // ✅ Ensure session and user data exist
  if (!session?.user) return null;

  const user: User = session.user as unknown as User; // ✅ Type assertion

  const getInitials = (name: string) => {
    const words = name.trim().split(" ");
    if (words.length > 1) {
      return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
    }
    return words[0][0].toUpperCase();
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
          <p className="text-xs text-gray-600 mt-1">{user.title}</p>
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
