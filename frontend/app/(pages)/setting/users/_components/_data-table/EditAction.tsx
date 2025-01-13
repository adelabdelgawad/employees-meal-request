import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil1Icon } from '@radix-ui/react-icons';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@radix-ui/react-dialog';
import { DialogHeader } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useAlerts } from '@/components/alert/useAlerts';
import { fetchUsers, fetchRoles } from '@/lib/services/setting-user';

export function EditDialog({ userId }: { userId: number }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [originalRoles, setOriginalRoles] = useState<number[]>([]);
  const { addAlert } = useAlerts();

  // Fetch all roles and user details when the dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      const fetchData = async () => {
        const roles = await fetchRoles();
        setAllRoles(roles);

        const userData = await fetchUsers(userId);
        if (userData && !Array.isArray(userData)) {
          setUser(userData);
          const roleIds = userData.roles
            .map((role) => (typeof role === 'string' ? null : role.id))
            .filter((id): id is number => id !== null);
          setSelectedRoles(roleIds);
          setOriginalRoles(roleIds);
        }
      };
      fetchData();
    }
  }, [isDialogOpen, userId]);

  // Handle role toggle
  const handleRoleToggle = (roleId: number) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId],
    );
  };

  // Check if there are any changes between original and selected roles
  const hasChanges = () => {
    const addedRoles = selectedRoles.filter(
      (roleId) => !originalRoles.includes(roleId),
    );
    const removedRoles = originalRoles.filter(
      (roleId) => !selectedRoles.includes(roleId),
    );
    return addedRoles.length > 0 || removedRoles.length > 0;
  };

  // Handle form submission
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const addedRoles = selectedRoles.filter(
      (roleId) => !originalRoles.includes(roleId),
    );
    const removedRoles = originalRoles.filter(
      (roleId) => !selectedRoles.includes(roleId),
    );

    addAlert(
      `Changes detected:\nAdded Roles: ${addedRoles.join(
        ', ',
      )}\nRemoved Roles: ${removedRoles.join(', ')}`,
      'success',
    );

    setOriginalRoles(selectedRoles);
    setIsDialogOpen(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Pencil1Icon className="mr-1" /> Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-[580px] bg-white rounded-lg shadow-lg p-6 max-h-[85vh] overflow-y-auto">
          <DialogHeader className="items-center mb-2">
            <DialogTitle>Edit User Details</DialogTitle>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-1">
            {user && (
              <>
                <div>
                  <span className="font-medium">Username:</span> {user.username}
                </div>
                <div>
                  <span className="font-medium">Full Name:</span>{' '}
                  {user.fullName}
                </div>
                <div className="m-2">
                  <h3 className="text-md font-medium mt-2">User Roles</h3>
                </div>
                {allRoles.map((role) => (
                  <div
                    key={role.id}
                    className="flex items-start justify-between mb-4"
                  >
                    <div>
                      <div className="font-medium text-left">{role.name}</div>
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
              </>
            )}

            <div className="flex gap-4 justify-end">
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
                onClick={() => setIsDialogOpen(false)}
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
