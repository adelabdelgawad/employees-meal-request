"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SheetFooter } from "@/components/ui/sheet";

interface UserEditFormProps {
  user: UserWithRoles;
  roles: Role[];
  onSave: (
    updatedUser: UserWithRoles,
    addedRoles: number[],
    removedRoles: number[]
  ) => void;
  onCancel: () => void;
}

export function UserEditForm({
  user,
  roles,
  onSave,
  onCancel,
}: UserEditFormProps) {
  console.log(user)
  const [active, setActive] = useState(user.active);
  const [userRoles, setUserRoles] = useState<{ [key: number]: boolean }>(() => {
    const mappedRoles: { [key: number]: boolean } = {};
    roles.forEach((role) => {
      mappedRoles[role.id] = user.roles[role.name] || false;
    });
    return mappedRoles;
  });
    const [addedRoles, setAddedRoles] = useState<number[]>([]);
  const [removedRoles, setRemovedRoles] = useState<number[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const activeChanged = active !== user.active;
    const rolesChanged = addedRoles.length > 0 || removedRoles.length > 0;
    setHasChanges(activeChanged || rolesChanged);
  }, [active, addedRoles, removedRoles, user.active]);

  const handleRoleToggle = (roleId: number) => {
    const newValue = !userRoles[roleId];

    setUserRoles((prev: { [key: number]: boolean }) => ({
      ...prev,
      [roleId]: newValue,
    }));

    if (newValue && !user.roles[roleId]) {
      setAddedRoles((prev) => [
        ...prev.filter((id) => id !== roleId),
        roleId,
      ]);
      setRemovedRoles((prev) => prev.filter((id) => id !== roleId));
    } else if (!newValue && user.roles[roleId]) {
      setRemovedRoles((prev) => [
        ...prev.filter((id) => id !== roleId),
        roleId,
      ]);
      setAddedRoles((prev) => prev.filter((id) => id !== roleId));
    } else {
      setAddedRoles((prev) => prev.filter((id) => id !== roleId));
      setRemovedRoles((prev) => prev.filter((id) => id !== roleId));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser = {
      ...user,
      active,
      roles: userRoles,
    };
    onSave(updatedUser, addedRoles, removedRoles);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="username">Username</Label>
          <div className="p-2 border rounded-md bg-muted/50">
            {user.username}
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="fullname">Full Name</Label>
          <div className="p-2 border rounded-md bg-muted/50">
            {user.fullname}
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <div className="p-2 border rounded-md bg-muted/50">{user.title}</div>
        </div>
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="user-active" className="flex-1">
            User Status
          </Label>
          <div className="flex items-center space-x-2">
            <Label
              htmlFor="user-active"
              className={active ? "text-green-500" : "text-red-500"}
            >
              {active ? "Active" : "Disabled"}
            </Label>
            <Switch
              id="user-active"
              checked={active}
              onCheckedChange={setActive}
            />
          </div>
        </div>
        <div className="space-y-4">
          <Label>Roles</Label>
          <div className="space-y-4">
            {roles.map((role) => (
              <div key={role.id} className="flex items-center justify-between">
                <Label htmlFor={`role-${role.id}`} className="flex-1">
                  {role.name}
                </Label>
                <Switch
                  id={`role-${role.id}`}
                  checked={userRoles[role.id]}
                  onCheckedChange={() => handleRoleToggle(role.id)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <SheetFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!hasChanges}>
          Save Changes
        </Button>
      </SheetFooter>
    </form>
  );
}
