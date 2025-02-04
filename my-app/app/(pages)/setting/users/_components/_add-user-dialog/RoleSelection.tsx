// RoleSelection.tsx
import { Switch } from "@/components/ui/switch";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export type Role = {
  id: number;
  name: string;
  description: string;
};

/**
 * Component for selecting user roles.
 *
 * @param {Object} props - Component props.
 * @param {Role[]} props.roles - Array of roles.
 * @param {number[]} props.selectedRoles - Array of selected role IDs.
 * @param {(roleId: number) => void} props.handleRoleToggle - Function to toggle role selection.
 */
export function RoleSelection({
  roles,
  selectedRoles,
  handleRoleToggle,
}: {
  roles: Role[];
  selectedRoles: number[];
  handleRoleToggle: (roleId: number) => void;
}) {
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
          <Switch
            checked={selectedRoles.includes(role.id)}
            onCheckedChange={() => handleRoleToggle(role.id)}
          />
        </div>
      ))}
    </div>
  );
}
