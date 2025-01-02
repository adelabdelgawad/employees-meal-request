import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface RoleModalProps {
  user: { name: string; roles: number[] }; // User with roles
  availableRoles: { id: number; name: string }[]; // All roles
  onSave: (updatedRoles: {
    added_roles: number[];
    removed_roles: number[];
  }) => void;
  onClose: () => void;
}

export default function RoleModal({
  user,
  availableRoles,
  onSave,
  onClose,
}: RoleModalProps) {
  const [assignedRoles, setAssignedRoles] = useState<number[]>(user.roles);

  // Calculate not assigned roles
  const notAssignedRoles = availableRoles.filter(
    (role) => !assignedRoles.includes(role.id)
  );

  const handleAddRole = (roleId: number) => {
    setAssignedRoles((prev) => [...prev, roleId]);
  };

  const handleRemoveRole = (roleId: number) => {
    setAssignedRoles((prev) => prev.filter((id) => id !== roleId));
  };

  const handleSave = () => {
    const addedRoles = assignedRoles.filter(
      (role) => !user.roles.includes(role)
    );
    const removedRoles = user.roles.filter(
      (role) => !assignedRoles.includes(role)
    );
    onSave({ added_roles: addedRoles, removed_roles: removedRoles });
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Roles for {user.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Dropdown for Available Roles */}
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">Add Role</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {notAssignedRoles.map((role) => (
                  <DropdownMenuItem
                    key={role.id}
                    onClick={() => handleAddRole(role.id)}
                  >
                    {role.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Assigned Roles with Remove Option */}
          <div className="flex flex-wrap gap-2">
            {assignedRoles.map((roleId) => {
              const role = availableRoles.find((r) => r.id === roleId);
              return (
                <Badge
                  key={roleId}
                  className="flex items-center space-x-1"
                  variant="secondary"
                >
                  {role?.name}
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleRemoveRole(roleId)}
                  >
                    ✕
                  </Button>
                </Badge>
              );
            })}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
