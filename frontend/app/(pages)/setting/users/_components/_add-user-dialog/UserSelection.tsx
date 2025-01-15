import { useState, useEffect, useRef } from 'react';
import { ChevronsUpDown, Check } from 'lucide-react';

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
  CommandEmpty,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';

export function UserSelection({
  filteredUsers,
  selectedUser,
  selectedUserId,
  setSelectedUserId,
}: {
  filteredUsers: any[];
  selectedUser: any;
  selectedUserId: number | null;
  setSelectedUserId: (id: number | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  // Scroll to the top of the CommandList whenever the filteredUsers array changes
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [filteredUsers]);

  // Reset input when the popover closes
  const handlePopoverChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSelectedUserId(null); // Reset the selected user ID when closing
    }
  };

  return (
    <Popover open={open} onOpenChange={handlePopoverChange}>
      <PopoverTrigger asChild>
        {/* Ensure this button does NOT submit a parent form */}
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedUser
            ? `${selectedUser.fullName} - ${selectedUser.title}`
            : 'Select User...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      {/* Remove `overflow-y-auto` here to avoid having two scrollbars */}
      <PopoverContent
        className="w-[480px] p-0 max-h-[300px]"
        onWheel={(e) => e.stopPropagation()}
      >
        <Command>
          {/* Once you type here, presumably filteredUsers will change */}
          <CommandInput placeholder="Search user..." />
          {/* Keep the scroll behavior only on CommandList */}
          <CommandList ref={listRef} className="max-h-[300px] overflow-y-auto">
            <CommandEmpty>No user found.</CommandEmpty>
            <CommandGroup>
              {filteredUsers.map((user) => (
                <CommandItem
                  key={user.id}
                  onSelect={() => {
                    if (user.id) {
                      setSelectedUserId(user.id);
                      setOpen(false);
                    }
                  }}
                  className="flex items-center gap-3"
                >
                  <div>
                    <div className="font-medium">{user.fullName}</div>
                    <div className="text-sm text-gray-500">
                      @{user.username} - {user.title}
                    </div>
                  </div>
                  {selectedUserId === user.id && (
                    <Check className="ml-auto opacity-100" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
