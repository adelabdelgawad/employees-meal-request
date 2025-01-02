"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import RoleModal from "./RoleModal";
import AddUserModal from "./AddUserModal";

interface RoleProps {
  id: number;
  name: string;
}

interface User {
  username: string;
  roles: number[];
}

interface UserTableProps {
  roles: RoleProps[];
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

export default function UserTable({ roles, users, setUsers }: UserTableProps) {
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [modalUser, setModalUser] = useState<User | null>(null);

  const handleAddUser = (user: User) => {
    setUsers((prev) => [...prev, user]);
    setIsAddUserOpen(false);
  };

  const handleSaveRoles = (updates: any) => {
    console.log("Role updates:", updates);
    setModalUser(null);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">User Management</h2>
        <Button onClick={() => setIsAddUserOpen(true)}>+ Add User</Button>
      </div>

      {/* Table */}
      <table className="w-full border rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-4 text-left">Name</th>
            <th className="p-4 text-left">Roles</th>
            <th className="p-4"></th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr key={index} className="border-b hover:bg-gray-50">
              <td className="p-4">{user.username}</td>
              <td className="p-4">
                {user.roles
                  .map((roleId) => roles.find((r) => r.id === roleId)?.name)
                  .join(", ")}
              </td>
              <td className="p-4 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost">⋮</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setModalUser(user)}>
                      Edit Roles
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add User Modal */}
      {isAddUserOpen && (
        <AddUserModal
          availableRoles={roles}
          onSave={handleAddUser}
          onClose={() => setIsAddUserOpen(false)}
        />
      )}

      {/* Edit Role Modal */}
      {modalUser && (
        <RoleModal
          user={modalUser}
          availableRoles={roles}
          onSave={handleSaveRoles}
          onClose={() => setModalUser(null)}
        />
      )}
    </div>
  );
}
