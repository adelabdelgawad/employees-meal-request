"use client";
import { Switch } from "@/components/ui/switch";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface RoleSelectionProps {
  roles: Role[];
  selectedRoles: number[];
  onRoleToggle: (roleId: number) => void;
}

export default function RoleSelection({
  roles,
  selectedRoles,
  onRoleToggle,
}: RoleSelectionProps) {
  return (
    <div>
      <VisuallyHidden asChild>
        <h3>User Roles</h3>
      </VisuallyHidden>
      {roles.map((role) => (
        <div key={role.id} className="flex items-center justify-between mb-2">
          <div>
            <div className="font-medium">{role.name}</div>
            <div className="text-sm text-gray-500">{role.description}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {selectedRoles.includes(role.id) ? "Remove Role" : "Add Role"}
            </span>
            <Switch
              checked={selectedRoles.includes(role.id)}
              onCheckedChange={() => onRoleToggle(role.id)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
