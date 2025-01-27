"use client";

import { useState, useEffect } from "react";
import { UserPlus, X as CrossIcon } from "lucide-react"; // Updated icon
import { Button } from "@/components/ui/button";
import { SkeletonContent } from "./SkeletonContent";
import { UserSelection } from "./UserSelection";
import { RoleSelection } from "./RoleSelection";

import { useSettingUserContext } from "@/hooks/SettingUserContext";
import { submitAddUser, fetchDomainUsers } from "@/lib/services/setting-user";
import { toastWarning } from "@/lib/utils/toast";
import toast from "react-hot-toast";

export function AddUserDialog() {
  const { domainUsers, setDomainUsers, roles, mutate } =
    useSettingUserContext();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const selectedUser = domainUsers.find((user) => user.id === selectedUserId);

  useEffect(() => {
    if (isDrawerOpen) {
      setLoading(true);
      fetchDomainUsers()
        .then((users) => setDomainUsers(users))
        .finally(() => setLoading(false));
    }
  }, [isDrawerOpen, setDomainUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUserId) {
      toastWarning("Please select a user.");
      return;
    }

    if (selectedRoles.length === 0) {
      toast.error("Please select at least one role.");
      return;
    }

    const selectedUser = domainUsers.find((user) => user.id === selectedUserId);

    if (!selectedUser) {
      toast.error("Failed to find the selected user.");
      return;
    }

    const response = await submitAddUser(
      selectedUser.username,
      selectedUser.fullName,
      selectedUser.title,
      selectedRoles
    );

    if (response.success) {
      toast.success("User added successfully.");
      await mutate();
      resetForm();
    } else {
      toast.error("Failed to add user.");
    }
  };

  const resetForm = () => {
    setSelectedUserId(null);
    setSelectedRoles([]);
    setIsDrawerOpen(false);
  };

  return (
    <div>
      {/* Trigger Button */}
      <button
        onClick={() => setIsDrawerOpen(true)}
        className="flex items-center justify-center gap-2 p-2 text-gray-700 hover:text-blue-600 cursor-pointer transition-colors"
      >
        <UserPlus className="w-4 h-4" />
        <span className="text-sm font-medium">Add User</span>
      </button>

      {/* Right-Side Drawer */}
      <div
        className={`fixed top-0 right-0 h-full bg-white shadow-lg transform ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-500 ease-in-out w-[30rem] z-50`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Add New User</h3>
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="hover:text-red-600 transition"
          >
            <CrossIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {loading ? (
            <SkeletonContent />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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
                      : [...prev, roleId]
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
                <Button
                  type="button"
                  onClick={resetForm}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
