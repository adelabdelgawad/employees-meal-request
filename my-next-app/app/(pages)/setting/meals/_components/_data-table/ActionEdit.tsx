"use client";

import { useState, useEffect, startTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { useSettingUserContext } from "@/hooks/SettingUserContext";
import toast from "react-hot-toast";
import { PencilIcon } from "lucide-react";
import clientAxiosInstance from "@/lib/clientAxiosInstance";

export default function ActionEdit({ userId }: { userId: number }) {
  // State variables
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [user, setUser] = useState<User>();
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [originalRoles, setOriginalRoles] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { users, mutate, roles } = useSettingUserContext();

  useEffect(() => {
    // Fetch user and roles data when the sheet opens
    if (!isSheetOpen) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const foundUser = users?.find((user) => user.id === userId);
        const userRoleIds = foundUser?.roles?.map((role) => role.id) || [];
        setUser(foundUser);
        setSelectedRoles(userRoleIds);
        setOriginalRoles(userRoleIds);
      } catch (error) {
        console.error("Error Setting User Info:", error);
        toast.error("Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isSheetOpen, userId, users]);

  // Handle toggling of roles.
  const handleRoleToggle = (roleId: number) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  // Check whether there are changes compared to the original roles.
  const hasChanges = (): boolean => {
    const addedRoles = selectedRoles.filter(
      (roleId) => !originalRoles.includes(roleId)
    );
    const removedRoles = originalRoles.filter(
      (roleId) => !selectedRoles.includes(roleId)
    );
    return addedRoles.length > 0 || removedRoles.length > 0;
  };

  // Handle form submission.
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
          removed_roles: removedRoles,
        };

        await clientAxiosInstance.put(`/user/${userId}/roles`, data);
        toast.success("User roles updated successfully!");
        setOriginalRoles(selectedRoles);
        setIsSheetOpen(false);

        // Refresh the users list from the context.
        await mutate();
      } catch (error) {
        console.error(error);
        toast.error("Failed to update user roles. Please try again.");
      }
    });
  };

  return (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button variant="outline">
          <PencilIcon className="mr-1" /> Edit
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-[580px]">

        {isLoading ? (
          <p>Loading...</p>
        ) : user ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <SheetHeader>
          <SheetTitle>Edit User Roles Settings</SheetTitle>
          <SheetDescription>{user.username}</SheetDescription>
        </SheetHeader>

            {roles.map((role) => (
              <div key={role.id} className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-medium">{role.name}</div>
                  <div className="text-sm text-gray-500">{role.description}</div>
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
                  !hasChanges() ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={!hasChanges()}
              >
                Save Changes
              </Button>
              <Button
                type="button"
                onClick={() => setIsSheetOpen(false)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <p>No user data found.</p>
        )}
      </SheetContent>
    </Sheet>
  );
}
