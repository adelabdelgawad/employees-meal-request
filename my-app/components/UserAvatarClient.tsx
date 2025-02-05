"use client";

import { logout } from "@/lib/session";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Crown, Type, Heading, BookOpen } from "lucide-react";

interface UserAvatarClientProps {
  session: Session | null;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function UserAvatarClient({ session }: UserAvatarClientProps) {
  const user = session?.user;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="cursor-pointer">
          <AvatarImage alt={user?.fullName} />
          <AvatarFallback>{getInitials(user?.fullName || "")}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-48" align="end">
        <DropdownMenuLabel>{user?.username}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
          <User className="w-4 h-4" />
          {user?.fullName}
        </DropdownMenuItem>

        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
          <BookOpen className="w-4 h-4" />
          {user?.title}
        </DropdownMenuItem>

        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer text-red-500 focus:bg-red-50">
          <LogOut className="w-4 h-4" />
          <button onClick={() => logout()}>Logout</button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
