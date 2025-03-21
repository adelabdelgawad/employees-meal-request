"use client";

import type React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { UserEditForm } from "./user-edit-form";

interface UserEditSheetProps {
  user: UserWithRoles;
  roles: Role[];
  onSave: (
    userId: number,
    active?: boolean,
    addedRolesIds?: number[],
    removedRolesIds?: number[]
  ) => void;
  onCancel: () => void;
}


export function UserEditSheet({
  user,
  roles,
  onSave: parentOnSave,
  onCancel,
}: UserEditSheetProps) {
  const handleSave = (
    updatedUser: UserWithRoles,
    addedRoles: number[],
    removedRoles: number[]
  ) => {
    const activeChanged = updatedUser.active !== user.active;
    const rolesChanged = addedRoles.length > 0 || removedRoles.length > 0;

    parentOnSave(
      updatedUser.id,
      activeChanged ? updatedUser.active : undefined,
      rolesChanged ? addedRoles : undefined,
      rolesChanged ? removedRoles : undefined
    );

    onCancel(); // Close the sheet after saving
  };

  return (
    <Sheet open={true} onOpenChange={() => onCancel()}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="text-center">Edit User</SheetTitle>
          <SheetDescription className="text-center">
            Modify user details and roles.
          </SheetDescription>
        </SheetHeader>
        <UserEditForm
          user={user}
          roles={roles}
          onSave={handleSave}
          onCancel={onCancel}
        />
      </SheetContent>
    </Sheet>
  );
}