'use client';

import { useState, useEffect, startTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogOverlay,
  DialogPortal,
  DialogClose,
} from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useAlerts } from '@/components/alert/useAlerts';
import {
  fetchUsers,
  fetchRoles,
  updateUserRoles,
} from '@/lib/services/setting-user';
import { useSettingUserContext } from '@/hooks/SettingUserContext';

interface EditUserDialogProps {
  userId: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditUserDialog({
  userId,
  isOpen,
  onOpenChange,
}: EditUserDialogProps) {
  const [user, setUser] = useState<User | null>(null);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [originalRoles, setOriginalRoles] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { addAlert } = useAlerts();
  const { mutate } = useSettingUserContext();

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);

        const roles = await fetchRoles();
        setAllRoles(roles);

        const userData = await fetchUsers(userId);
        if (userData) {
          setUser(userData);

          const roleIds = userData.roles.map((role: Role) => role.id);
          setSelectedRoles(roleIds);
          setOriginalRoles(roleIds);
        }
      } catch {
        addAlert('Error fetching user data.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isOpen, userId, addAlert]);

  const handleRoleToggle = (roleId: number) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId],
    );
  };

  const hasChanges = () => {
    const addedRoles = selectedRoles.filter(
      (roleId) => !originalRoles.includes(roleId),
    );
    const removedRoles = originalRoles.filter(
      (roleId) => !selectedRoles.includes(roleId),
    );
    return addedRoles.length > 0 || removedRoles.length > 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const addedRoles = selectedRoles.filter(
      (roleId) => !originalRoles.includes(roleId),
    );
    const removedRoles = originalRoles.filter(
      (roleId) => !selectedRoles.includes(roleId),
    );

    startTransition(async () => {
      try {
        await updateUserRoles(userId, addedRoles, removedRoles);
        addAlert('User roles updated successfully!', 'success');
        setOriginalRoles(selectedRoles);
        onOpenChange(false);
        await mutate();
      } catch {
        addAlert('Failed to update user roles. Please try again.', 'error');
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50" />
        <DialogContent className="fixed top-0 right-0 h-full w-[30rem] bg-white shadow-lg transform transition-transform duration-500 ease-in-out z-50">
          <div className="flex justify-between items-center p-4 border-b">
            <DialogTitle>Edit User Details</DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                <Cross2Icon className="w-5 h-5" />
              </Button>
            </DialogClose>
          </div>

          <div className="p-4">
            {isLoading ? (
              <p>Loading...</p>
            ) : user ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <span className="font-medium">Username:</span> {user.username}
                </div>
                <div>
                  <span className="font-medium">Full Name:</span>{' '}
                  {user.fullName}
                </div>

                <h3 className="text-md font-medium mt-4">User Roles</h3>

                {allRoles.map((role) => (
                  <div
                    key={role.id}
                    className="flex items-start justify-between mb-4"
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

                <div className="flex justify-end gap-4">
                  <Button
                    type="submit"
                    className={`bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md ${
                      !hasChanges() && 'opacity-50 cursor-not-allowed'
                    }`}
                    disabled={!hasChanges()}
                  >
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <p>No user data found.</p>
            )}
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
}
