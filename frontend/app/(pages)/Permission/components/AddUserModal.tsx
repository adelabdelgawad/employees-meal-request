import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

interface AddUserModalProps {
  availableRoles: { id: number; name: string }[]; // List of roles
  onSave: (user: { name: string; roles: number[] }) => void;
  onClose: () => void;
}

export default function AddUserModal({
  availableRoles,
  onSave,
  onClose,
}: AddUserModalProps) {
  const [userName, setUserName] = useState("");
  const [assignedRoles, setAssignedRoles] = useState<number[]>([]);

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

  const handleSave = async () => {
    if (!userName.trim()) return;
    console.log(assignedRoles);
    const payload = { username: userName.trim() };

    try {
      const response = await fetch("http://10.23.1.207:8000/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save user");
      }

      console.log("User saved successfully:", payload);
      onSave({ name: userName, roles: assignedRoles });
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* User Name Input */}
          <div>
            <label className="text-sm font-medium text-gray-700">Name</label>
            <Input
              placeholder="Enter user name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>

          {/* Dropdown for Roles */}
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

          {/* Assigned Roles */}
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
          <Button onClick={handleSave} disabled={!userName.trim()}>
            Save User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
