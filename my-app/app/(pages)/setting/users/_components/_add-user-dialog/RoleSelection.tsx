import { Switch } from '@/components/ui/switch';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

type Role = {
  id: number;
  name: string;
  description: string;
};

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
