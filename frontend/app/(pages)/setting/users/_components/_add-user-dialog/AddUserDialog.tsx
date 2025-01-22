'use client';

import { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUserId) {
      addAlert('Please select a user.', 'warning');
      return;
    }

    if (selectedRoles.length === 0) {
      addAlert('Please select at least one role.', 'warning');
      return;
    }

    const selectedUser = domainUsers.find((user) => user.id === selectedUserId);

    if (!selectedUser) {
      addAlert('Failed to find the selected user.', 'error');
      return;
    }

    const response = await submitAddUser(
      selectedUser.username,
      selectedUser.fullName,
      selectedUser.title,
      selectedRoles,
    );

    if (response.success) {
      addAlert(response.message, 'success');
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
      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Trigger asChild>
          <div>
            <Button variant="outline" size="sm" className="h-10 border-dashed">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content
            className={`fixed top-0 right-0 h-full w-[30rem] bg-white shadow-lg transform transition-transform duration-500 ease-in-out ${
              isDialogOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <Dialog.Title className="text-lg font-semibold">
                Add New User
              </Dialog.Title>
              <Dialog.Close asChild>
                <Button variant="ghost">
                  <Cross2Icon className="w-5 h-5" />
                </Button>
              </Dialog.Close>
            </div>

            <div className="p-4">
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
                  <div className="flex justify-end gap-4">
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Save Changes
                    </Button>
                    <Dialog.Close asChild>
                      <Button
                        type="button"
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Cancel
                      </Button>
                    </Dialog.Close>
                  </div>
                </form>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
