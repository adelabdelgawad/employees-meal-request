// AddUserDialog.tsx
"use client";

import { UserPlus, X as CrossIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SkeletonContent } from "./SkeletonContent";
import { RoleSelection } from "./RoleSelection";
import { AddUserDialogProvider, useAddUserDialogContext } from "./AddUserDialogContext";
import { useSettingUserContext } from "@/hooks/SettingUserContext";
import { UserSelection } from "./UserSelectionInput";

/**
 * The internal content of the Add User Dialog.
 */
function AddUserDialogContent() {
  const {
    isDrawerOpen,
    setIsDrawerOpen,
    resetForm,
    handleSubmit,
    setSelectedUser,
    selectedRoles,
    setSelectedRoles,
    loading,
  } = useAddUserDialogContext();
  const { domainUsers, roles } = useSettingUserContext();

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
                users={domainUsers}
                onUserSelect={setSelectedUser}
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

/**
 * The AddUserDialog component wrapped with its context provider.
 */
export function AddUserDialog() {
  return (
    <AddUserDialogProvider>
      <AddUserDialogContent />
    </AddUserDialogProvider>
  );
}
