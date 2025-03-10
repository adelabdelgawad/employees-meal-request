// components/UserAvatarClient.tsx
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { logout } from '@/lib/session';
import { User, LogOut, BookOpen } from 'lucide-react';

interface UserAvatarClientProps {
  session: {
    user: {
      fullname: string;
      username: string;
      title: string;
    };
  } | null;
}


function getInitials(name: string): string {
  const words = name.trim().split(' ');
  if (words.length === 1) {
    // Single word (username), return the first two characters
    return words[0].slice(0, 2).toUpperCase();
  } else {
    // Multiple words, return the first letter of the first two words
    return words.slice(0, 2).map(word => word[0].toUpperCase()).join('');
  }
}


export default function UserAvatarClient({ session }: UserAvatarClientProps) {
  const user = session?.user;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarImage alt={user?.fullname} />
          <AvatarFallback>{getInitials(user?.username || '')}</AvatarFallback>        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuLabel>{user?.username}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem className="flex items-center gap-2">
          <User className="w-4 h-4" />
          {user?.fullname}
        </DropdownMenuItem>

        <DropdownMenuItem className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          {user?.title}
        </DropdownMenuItem>

        {/* The logout action is now called via a form submission to the server action */}
        <DropdownMenuItem asChild>
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 text-red-500 focus:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
