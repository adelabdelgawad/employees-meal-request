"use client";

import { useState, useMemo } from "react";
import type { User, Role } from "@/types";
import {
  Search,
  Check,
  Filter,
  ChevronDown,
  Pencil,
  UserPlus,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { UserEditForm } from "./user-edit-form";
import { NewUserForm } from "./new-user-form";
import toast from "react-hot-toast";

interface UsersTableProps {
  initialUsers: User[];
  roles: Role[];
}

export function UsersTable({ initialUsers, roles }: UsersTableProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);

  // Filter users based on search query and selected roles
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Filter by search query
      const matchesSearch =
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by selected roles
      const matchesRoles =
        selectedRoles.length === 0 ||
        selectedRoles.some((roleId) => user.roles[roleId]);

      return matchesSearch && matchesRoles;
    });
  }, [users, searchQuery, selectedRoles]);

  // Toggle role selection for filtering
  const toggleRole = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  // Update the handleSaveUser function to use toast properly
  const handleSaveUser = (
    updatedUser: User,
    addedRoles: string[],
    removedRoles: string[]
  ) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
    setEditingUser(null);

    // Create a message about role changes
    let roleChangeMessage = "";
    if (addedRoles.length > 0) {
      const addedRoleNames = addedRoles
        .map((id) => roles.find((r) => r.id === id)?.name)
        .filter(Boolean);
      roleChangeMessage += `Added roles: ${addedRoleNames.join(", ")}. `;
    }
    if (removedRoles.length > 0) {
      const removedRoleNames = removedRoles
        .map((id) => roles.find((r) => r.id === id)?.name)
        .filter(Boolean);
      roleChangeMessage += `Removed roles: ${removedRoleNames.join(", ")}. `;
    }

    // Create a message about status change
    const statusMessage =
      updatedUser.active !== editingUser?.active
        ? `User ${updatedUser.active ? "activated" : "deactivated"}.`
        : "";

    toast.success("User Updated");
  };

  // Update the handleCreateUser function to use toast properly
  const handleCreateUser = (newUserData: Omit<User, "id">) => {
    const newUser = {
      ...newUserData,
      id: Math.max(...users.map((u) => u.id), 0) + 1,
    };

    setUsers((prev) => [...prev, newUser]);
    setIsAddingUser(false);

    // Get the names of the assigned roles
    const assignedRoleNames = Object.entries(newUser.roles)
      .filter(([_, isAssigned]) => isAssigned)
      .map(([roleId]) => roles.find((r) => r.id === roleId)?.name)
      .filter(Boolean);

    const rolesMessage =
      assignedRoleNames.length > 0
        ? `Assigned roles: ${assignedRoleNames.join(", ")}.`
        : "No roles assigned.";
    toast.success("User created");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle>Users</CardTitle>
          <Sheet open={isAddingUser} onOpenChange={setIsAddingUser}>
            <SheetTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Add New User</SheetTitle>
                <SheetDescription>
                  Create a new user and assign roles.
                </SheetDescription>
              </SheetHeader>
              <NewUserForm
                roles={roles}
                onSave={handleCreateUser}
                onCancel={() => setIsAddingUser(false)}
              />
            </SheetContent>
          </Sheet>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by username or full name..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto">
                <Filter className="h-4 w-4 mr-2" />
                Filter by Role
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              {roles.map((role) => (
                <DropdownMenuCheckboxItem
                  key={role.id}
                  checked={selectedRoles.includes(role.id)}
                  onCheckedChange={() => toggleRole(role.id)}
                >
                  {role.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Username</TableHead>
                <TableHead className="w-[220px]">Full Name</TableHead>
                <TableHead className="w-[220px]">Title</TableHead>
                {roles.map((role) => (
                  <TableHead key={role.id} className="text-center">
                    {role.name}
                  </TableHead>
                ))}
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className={!user.active ? "opacity-60" : undefined}
                  >
                    <TableCell className="font-medium">
                      {user.username}
                      {!user.active && (
                        <Badge
                          variant="outline"
                          className="ml-2 text-red-500 border-red-200"
                        >
                          Disabled
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.title}</Badge>
                    </TableCell>
                    {roles.map((role) => (
                      <TableCell key={role.id} className="text-center">
                        <div className="flex justify-center">
                          <Check
                            className={`h-5 w-5 ${
                              user.roles[role.id]
                                ? "text-green-500"
                                : "text-gray-200 dark:text-gray-700"
                            }`}
                          />
                        </div>
                      </TableCell>
                    ))}
                    <TableCell>
                      <Sheet
                        open={editingUser?.id === user.id}
                        onOpenChange={(open) => {
                          if (!open) setEditingUser(null);
                        }}
                      >
                        <SheetTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingUser(user)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent>
                          <SheetHeader>
                            <SheetTitle>Edit User</SheetTitle>
                            <SheetDescription>
                              Make changes to user information and role
                              assignments.
                            </SheetDescription>
                          </SheetHeader>
                          {editingUser && (
                            <UserEditForm
                              user={editingUser}
                              roles={roles}
                              onSave={handleSaveUser}
                              onCancel={() => setEditingUser(null)}
                            />
                          )}
                        </SheetContent>
                      </Sheet>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4 + roles.length}
                    className="h-24 text-center"
                  >
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </CardContent>
    </Card>
  );
}
