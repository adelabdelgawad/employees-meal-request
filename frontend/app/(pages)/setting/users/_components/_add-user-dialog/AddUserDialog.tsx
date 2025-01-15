'use client';

import { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SkeletonContent } from './SkeletonContent';
import { UserSelection } from './UserSelection';
import { RoleSelection } from './RoleSelection';

import { useSettingUserContext } from '@/hooks/SettingUserContext';
import { useAlerts } from '@/components/alert/useAlerts';
import { submitAddUser, fetchDomainUsers } from '@/lib/services/setting-user';

export function AddUserDialog() {
  const { domainUsers, setDomainUsers, roles, mutate } =
    useSettingUserContext();
  const { addAlert } = useAlerts();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const selectedUser = domainUsers.find((user) => user.id === selectedUserId);

  useEffect(() => {
    if (isDialogOpen) {
      setLoading(true);
      fetchDomainUsers()
        .then((users) => setDomainUsers(users))
        .finally(() => setLoading(false));
    }
  }, [isDialogOpen, setDomainUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate user selection on form submission
    if (!selectedUserId) {
      addAlert('Please select a user.', 'warning');
      return;
    }

    // Validate role selection
    if (selectedRoles.length === 0) {
      addAlert('Please select at least one role.', 'warning');
      return;
    }

    const selectedUser = domainUsers.find((user) => user.id === selectedUserId);

    if (!selectedUser) {
      addAlert('Failed to find the selected user.', 'error');
      return;
    }

    // Proceed to submit the form
    const response = await submitAddUser(
      selectedUser.username,
      selectedUser.fullName,
      selectedUser.title,
      selectedRoles,
    );

    if (response.success) {
      addAlert(response.message, 'success');

      // ✅ Trigger the mutate function to refresh the users array
      await mutate();

      resetForm();
    } else {
      addAlert('Failed to add user.', 'error');
    }
  };

  const resetForm = () => {
    setSelectedUserId(null);
    setSelectedRoles([]);
    setIsDialogOpen(false);
  };

  return (
    <div className="text-center">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <div>
            <Button variant="outline" size="sm" className="h-10 border-dashed">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        </DialogTrigger>

        <DialogContent className="sm:max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Select a user and assign roles to add them to your domain.
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <SkeletonContent />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <UserSelection
                filteredUsers={domainUsers}
                selectedUser={selectedUser}
                selectedUserId={selectedUserId}
                setSelectedUserId={setSelectedUserId}
              />
              <RoleSelection
                roles={roles}
                selectedRoles={selectedRoles}
                handleRoleToggle={(roleId) => {
                  setSelectedRoles((prev) =>
                    prev.includes(roleId)
                      ? prev.filter((id) => id !== roleId)
                      : [...prev, roleId],
                  );
                }}
              />
              <DialogFooter className="flex justify-end gap-4">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Save Changes
                </Button>
                <DialogClose asChild>
                  <Button
                    type="button"
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Cancel
                  </Button>
                </DialogClose>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
