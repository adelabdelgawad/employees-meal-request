"use client"

import React, { useState, useEffect } from "react"
import Select from "react-select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { SheetFooter } from "@/components/ui/sheet"

// You likely have these types defined elsewhere in your project.
// For this example, we assume Role, UserCreate, and UserWithRoles are defined.
interface Role {
  id: number | string;
  name: string;
}

interface UserCreate {
  id: number;
  username: string;
  fullname: string;
  title: string;
  roles: number[];
  active: boolean;
}

interface UserWithRoles {
  id: number;
  username: string;
  fullname: string;
  title: string;
  roles: Record<string, boolean>;
  active: boolean;
}

/**
 * Represents a user option for the ComboBox.
 */
interface UserOption {
  value: string;
  label: string;
  user: {
    username: string;
    fullname: string;
    title: string;
  };
}

interface NewUserFormProps {
  roles: Role[];
  /**
   * List of available users.
   */
  usersList: { username: string; fullname: string; title: string }[];
  /**
   * Callback when the user data is ready to be saved.
   */
  onSave: (userData: UserCreate) => void;
  /**
   * Callback when the form is cancelled.
   */
  onCancel: () => void;
}

export function NewUserForm({ roles, usersList, onSave, onCancel }: NewUserFormProps) {
  // Build the initial roles object.
  const initialRoles: Record<string, boolean> = {};
  roles.forEach((role) => {
    initialRoles[role.id] = false;
  });

  // The formData state holds all form values.
  const [formData, setFormData] = useState<UserWithRoles>({
    id: 0,
    username: "",
    fullname: "",
    title: "",
    roles: initialRoles,
    active: true,
  });

  // State to hold the selected ComboBox option.
  const [selectedUserOption, setSelectedUserOption] = useState<UserOption | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Map usersList into the format expected by react-select.
  const userOptions: UserOption[] = usersList.map((user) => ({
    value: user.username,
    label: `${user.fullname} (${user.title})`,
    user,
  }));

  // Check if any changes have been made in the form.
  useEffect(() => {
    const hasUserSelected =
      formData.username.trim() !== "" ||
      formData.fullname.trim() !== "" ||
      formData.title.trim() !== "";
    const hasRoles = Object.values(formData.roles).some((value) => value);
    setHasChanges(hasUserSelected || hasRoles);
  }, [formData]);

  /**
   * Updates formData when a user is selected from the ComboBox.
   *
   * @param option - The selected user option or null.
   */
  const handleUserSelect = (option: UserOption | null) => {
    setSelectedUserOption(option);
    if (option) {
      const { username, fullname, title } = option.user;
      setFormData((prev) => ({
        ...prev,
        username,
        fullname,
        title,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        username: "",
        fullname: "",
        title: "",
      }));
    }
  };

  /**
   * Toggles the selected role.
   *
   * @param roleId - The role id to toggle.
   */
  const handleRoleToggle = (roleId: string) => {
    setFormData((prev) => ({
      ...prev,
      roles: {
        ...prev.roles,
        [roleId]: !prev.roles[roleId],
      },
    }));
  };

  /**
   * Handles form submission by converting the roles record into an array of role IDs.
   *
   * @param e - The form submission event.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Convert roles record into an array of role IDs (number) where the value is true.
    const selectedRoles = Object.entries(formData.roles)
      .filter(([isSelected]) => isSelected)
      .map(([roleId]) => parseInt(roleId.toString()));

    const userToCreate: UserCreate = {
      id: formData.id,
      username: formData.username,
      fullname: formData.fullname,
      title: formData.title,
      roles: selectedRoles,
      active: formData.active,
    };

    onSave(userToCreate);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* ComboBox for selecting a user */}
        <div className="grid gap-2">
          <Label htmlFor="user-select">Select User</Label>
          <Select
            id="user-select"
            options={userOptions}
            value={selectedUserOption}
            onChange={handleUserSelect}
            isClearable
            placeholder="Select a user..."
          />
        </div>

        {/* Active switch */}
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="new-user-active" className="flex-1">
            User Status
          </Label>
          <div className="flex items-center space-x-2">
            <Label
              htmlFor="new-user-active"
              className={formData.active ? "text-green-500" : "text-red-500"}
            >
              {formData.active ? "Active" : "Disabled"}
            </Label>
            <Switch
              id="new-user-active"
              checked={formData.active}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, active: checked }))
              }
            />
          </div>
        </div>

        {/* Role toggles */}
        <div className="space-y-4">
          <Label>Roles</Label>
          <div className="space-y-4">
            {roles.map((role) => (
              <div key={role.id} className="flex items-center justify-between">
                <Label htmlFor={`new-role-${role.id}`} className="flex-1">
                  {role.name}
                </Label>
                <Switch
                  id={`new-role-${role.id}`}
                  checked={formData.roles[role.id]}
                  onCheckedChange={() => handleRoleToggle(role.id.toString())}
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
          Create User
        </Button>
      </SheetFooter>
    </form>
  );
}
