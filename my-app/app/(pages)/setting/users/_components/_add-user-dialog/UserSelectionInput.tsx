import * as React from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"; // adjust import path as needed
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"; // your popover component
import { Button } from "@/components/ui/button"; // your button component

/**
 * User data type.
 */
export interface User {
  id: number;
  username: string;
  fullName: string;
  title: string;
}

interface UserSelectionProps {
  /** List of users to select from */
  users: DomainUser[];
  /** Callback fired when a user is selected */
  onUserSelect: (user: DomainUser | null) => void;
}

export function UserSelection({ users, onUserSelect }: UserSelectionProps) {
  const [open, setOpen] = React.useState(false);
  const [filteredUsers, setFilteredUsers] = React.useState<DomainUser[]>(users);
  const [inputValue, setInputValue] = React.useState("");
  // Ref for the CommandList component
  const commandListRef = React.useRef<HTMLDivElement>(null);

  // Update filteredUsers whenever inputValue or the users list changes.
  React.useEffect(() => {
    const search = inputValue.toLowerCase().trim();
    if (!search) {
      setFilteredUsers(users);
      return;
    }
    const filtered = users.filter(
      (user) =>
        user.username.toLowerCase().includes(search) ||
        user.fullName.toLowerCase().includes(search) ||
        user.title.toLowerCase().includes(search)
    );
    setFilteredUsers(filtered);
  }, [inputValue, users]);

  // Scroll to top of CommandList when Popover is opened
  React.useEffect(() => {
    if (open && commandListRef.current) {
      commandListRef.current.scrollTop = 0;
    }
  }, [open]);

  function handleSelect(user: User) {
    onUserSelect(user);
    setInputValue(`${user.fullName} (${user.username})`);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          {inputValue || "Select user..."}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0">
        <Command>
          <CommandInput
            placeholder="Search users..."
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList ref={commandListRef}>
            <CommandEmpty>No users found.</CommandEmpty>
            <CommandGroup heading="Users">
              {filteredUsers.map((user) => (
                <CommandItem
                  key={user.username}
                  value={`${user.username} ${user.fullName} ${user.title}`}
                  onSelect={() => handleSelect(user)}
                >
                  <div>
                    <div className="font-medium">{user.fullName}</div>
                    <div className="text-sm text-gray-500">
                      @{user.username} - {user.title}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            {filteredUsers.length !== users.length && <CommandSeparator />}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
