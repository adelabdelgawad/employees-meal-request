'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { useSettingUserContext } from '@/hooks/SettingUserContext';
import { submitAddUser } from '@/lib/services/setting-user';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@radix-ui/react-dialog';
import { DialogHeader } from '@/components/ui/dialog';
import { useAlerts } from '@/components/alert/useAlerts';

export function AddUserDialog() {
  const { domainUsers, roles, loading } = useSettingUserContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const selectedUser = domainUsers.find((user) => user.id === selectedUserId);
  const { addAlert } = useAlerts();

  // Handle role toggle
  const handleRoleToggle = (roleId: number) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId],
    );
  };

  // Filter users based on search query (only by fullName or username)
  const filteredUsers = domainUsers.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Form submission
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUserId) {
      addAlert('Please select a user.', 'warning');
      return;
    }

    if (selectedRoles.length === 0) {
      addAlert('Please select at least one role.', 'warning');
      return;
    }

    const response = await submitAddUser(selectedUserId, selectedRoles);

    if (response.success) {
      addAlert(response.message, 'success');
      setSelectedUserId(null);
      setSelectedRoles([]);
      setIsDialogOpen(false);
    } else {
      addAlert('Failed to add user.', 'error');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          <Plus className="w-5 h-5" /> Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-[580px] bg-white rounded-lg shadow-lg p-6 max-h-[85vh] overflow-y-auto">
          <DialogHeader className="items-center">
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-4">
            {/* User Selection */}
            <div>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    {selectedUser
                      ? `${selectedUser.fullName} - ${selectedUser.title}`
                      : 'Select User...'}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search user..."
                      className="h-9"
                      value={searchQuery}
                      onValueChange={(value) => setSearchQuery(value)}
                    />

                    <CommandList>
                      <CommandEmpty>No user found.</CommandEmpty>
                      <CommandGroup>
                        {filteredUsers.map((user) => (
                          <CommandItem
                            key={user.id}
                            onSelect={() => {
                              setSelectedUserId(user.id);
                              setOpen(false);
                            }}
                            className="flex items-center gap-3"
                          >
                            <div className="flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full text-gray-700 font-semibold">
                              {user.fullName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium">{user.fullName}</div>
                              <div className="text-sm text-gray-500">
                                @{user.username} - {user.title}
                              </div>
                            </div>
                            <Check
                              className={cn(
                                'ml-auto',
                                selectedUserId === user.id
                                  ? 'opacity-100'
                                  : 'opacity-0',
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Roles Selection */}
            <div>
              <h3 className="text-md font-medium mb-2">User Roles</h3>
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-center justify-between mb-2"
                >
                  <div>
                    <div className="font-medium">{role.name}</div>
                    <div className="text-sm text-gray-500">
                      {role.description}
                    </div>
                  </div>
                  <Switch
                    checked={selectedRoles.includes(role.id)}
                    onCheckedChange={() => handleRoleToggle(role.id)}
                  />
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 justify-end">
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Save Changes
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setSelectedUserId(null);
                  setSelectedRoles([]);
                  setIsDialogOpen(false);
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
