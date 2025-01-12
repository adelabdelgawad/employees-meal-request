'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface UserAvatarProps {
  firstName: string;
  lastName: string;
}

export function UserAvatar({ firstName, lastName }: UserAvatarProps) {
  const initials = `${firstName[0]}${lastName[0]}`;

  return (
    <Avatar className="h-8 w-8">
      <AvatarFallback className="bg-primary text-primary-foreground">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
