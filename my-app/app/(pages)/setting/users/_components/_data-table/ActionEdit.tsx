"use client";

import { useState, useEffect, startTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@radix-ui/react-dialog";
import { DialogHeader } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  fetchUsers,
  fetchRoles,
  updateUserRoles,
} from "@/lib/services/setting-user";
import { useSettingUserContext } from "@/hooks/SettingUserContext";
import toast from "react-hot-toast";
import { PencilIcon } from "lucide-react";
import clientAxiosInstance from "@/lib/clientAxiosInstance";

export default function ActionEdit({ userId }: { userId: number }) {
  // State variables
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [originalRoles, setOriginalRoles] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { mutate } = useSettingUserContext();

  // Fetch user and roles data when the dialog opens
  useEffect(() => {
    if (!isDialogOpen) return;

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
        toast.error("Error fetching user data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isDialogOpen, userId]);

  // Handle role toggle
  const handleRoleToggle = (roleId: number) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  // Check if roles have changed
  const hasChanges = () => {
    const addedRoles = selectedRoles.filter(
      (roleId) => !originalRoles.includes(roleId)
    );
    const removedRoles = originalRoles.filter(
      (roleId) => !selectedRoles.includes(roleId)
    );
    return addedRoles.length > 0 || removedRoles.length > 0;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const addedRoles = selectedRoles.filter(
      (roleId) => !originalRoles.includes(roleId)
    );
    const removedRoles = originalRoles.filter(
      (roleId) => !selectedRoles.includes(roleId)
    );

    startTransition(async () => {
      try {
        const data = {
          added_roles: addedRoles,
          removed_roles: removedRoles
        };

        await clientAxiosInstance.put(`/user/${userId}/roles`, data);
        toast.success("User roles updated successfully!");
        setOriginalRoles(selectedRoles);
        setIsDialogOpen(false);
        await mutate();
      } catch {
        toast.error("Failed to update user roles. Please try again.");
      }
    });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PencilIcon className="mr-1" /> Edit
        </Button>
      </DialogTrigger>

      <DialogContent className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="w-[580px] bg-white rounded-lg shadow-lg p-6 max-h-[85vh] overflow-y-auto">
          <DialogHeader className="items-center mb-2">
            <DialogTitle>Edit User Details</DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <p>Loading...</p>
          ) : user ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <span className="font-medium">Username:</span> {user.username}
              </div>
              <div>
                <span className="font-medium">Full Name:</span> {user.fullName}
              </div>

              <h3 className="text-md font-medium mt-4">User Roles</h3>

              {allRoles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-start justify-between mb-4"
                >
                  <div>
                    <div className="font-medium flex items-start">
                      {role.name}
                    </div>
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
                    !hasChanges() && "opacity-50 cursor-not-allowed"
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
          ) : (
            <p>No user data found.</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
