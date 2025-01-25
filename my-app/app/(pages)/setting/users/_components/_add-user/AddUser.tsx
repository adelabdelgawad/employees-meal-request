import React, { useState } from "react";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import UserSelection from "./UserSelection";
import RoleSelection from "./RoleSelection";
import { submitAddUser } from "@/lib/services/setting-user";
import { Drawer } from "./Drawer";
import { SaveButton } from "./SaveButton";

interface User {
  id: number;
  fullName: string;
  username: string;
  title: string;
}

interface AddUserProps {
  domainUsers: User[];
  roles: Role[];
  onUserAdded?: () => void;
}

export const AddUser: React.FC<AddUserProps> = ({
  domainUsers,
  roles,
  onUserAdded,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDrawerOpen = () => {
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    resetForm();
  };

  const handleRoleToggle = (roleId: number) => {
    setSelectedRoles(
      (prev) =>
        prev.includes(roleId)
          ? prev.filter((id) => id !== roleId) // Remove role if already selected
          : [...prev, roleId] // Add role if not selected
    );
  };

  const confirmSave = async () => {
    if (!selectedUserId || !selectedRoles.length || !selectedUser) {
      toast.error("Please ensure all fields are filled correctly.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await submitAddUser(
        selectedUser.username,
        selectedUser.fullName,
        selectedUser.title,
        selectedRoles
      );

      if (response.success) {
        toast.success(response.message);
        onUserAdded?.();
        handleDrawerClose();
      } else {
        toast.error(response.message || "Failed to add user.");
      }
    } catch (error) {
      toast.error("An error occurred while adding the user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSelectedUserId(null);
    setSelectedRoles([]);
  };

  return (
    <div>
      <Button
        onClick={handleDrawerOpen}
        className="flex items-center justify-center gap-2 p-2 text-gray-700 hover:text-blue-600 cursor-pointer transition-colors bg-transparent hover:bg-transparent shadow-none"
      >
        <UserPlus className="w-4 h-4" />
        <span className="text-sm font-medium">Add User</span>
      </Button>

      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        title="Add New User"
      >
        <UserSelection
          filteredUsers={domainUsers}
          selectedUserId={selectedUserId}
          setSelectedUserId={setSelectedUserId}
          setSelectedUser={setSelectedUser}
        />
        <RoleSelection
          roles={roles}
          selectedRoles={selectedRoles}
          onRoleToggle={handleRoleToggle}
        />
        <SaveButton isSubmitting={isSubmitting} onClick={confirmSave} />
      </Drawer>
    </div>
  );
};

export default AddUser;
