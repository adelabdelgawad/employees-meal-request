"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  Pencil,
  UserPlus,
  CircleCheckIcon,
  CircleXIcon,
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
import useSWR, { mutate } from "swr"
import { createUser } from "@/lib/actions/user.actions";
import toast from "react-hot-toast";


// Define the API endpoint for fetching users
const USERS_API_ENDPOINT = "/api/users"

// Fetcher function for useSWR
const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error("Failed to fetch users")
  }
  return response.json()
}

interface UsersTableProps {
  initialUsers: UserWithRoles[]
  roles: Role[]
}

/**
 * TableWithSWR component fetches meals data using SWR and renders it in a table.
 */
export default function UsersTable({ initialUsers, roles  }: UsersTableProps) {
  // Use SWR for data fetching with initial data
  // Use SWR for data fetching with initial data
  const {
    data: users = initialUsers,
    error,
    isValidating,
  } = useSWR<UserWithRoles[]>(USERS_API_ENDPOINT, fetcher, {
    fallbackData: initialUsers,
    revalidateOnFocus: false,
    dedupingInterval: 5000, // 5 seconds
  })

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [editingUser, setEditingUser] = useState<UserWithRoles | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);

  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    return users.filter((user) => {
      const matchesSearch =
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.fullname.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRoles =
        selectedRoles.length === 0 ||
        selectedRoles.some((roleId) => Object.keys(user.roles || {}).includes(roleId.toString()));
      return matchesSearch && matchesRoles;
    });
  }, [users, searchQuery, selectedRoles]);

  const toggleRole = (roleId: number) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

    // Update the handleCreateUser function to use useSWR
    const handleCreateUser = async (newUserData: UserCreate) => {
      try {
        // Call the server action
        const result = await createUser(newUserData)
  
        if (result.success && result.user) {
          // Close the add user form
          setIsAddingUser(false)
  
          // Optimistically update the UI
          const updatedUsers = [...users, result.user]
          mutate(USERS_API_ENDPOINT, updatedUsers, false)
  
          // Get the names of the assigned roles
          const assignedRoleNames = Object.entries(result.user.roles)
            .filter(([_, isAssigned]) => isAssigned)
            .map(([roleId]) => roles.find((r) => r.id === Number(roleId))?.name)
            .filter(Boolean)
  
          const rolesMessage =
            assignedRoleNames.length > 0 ? `Assigned roles: ${assignedRoleNames.join(", ")}.` : "No roles assigned."
  
          // Show success toast
          toast.success("User created")

          // Revalidate the data
          mutate(USERS_API_ENDPOINT)
        } else {
          throw new Error("Failed to create user")
        }
      } catch (error) {
        console.error("Error creating user:", error)
  
        // Show error toast
        toast.error("There was a problem creating the user. Please try again")
        // Revalidate to get the correct data
        mutate(USERS_API_ENDPOINT)
      }
    }
  
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="text-center">Users</CardTitle>
          <Sheet open={isAddingUser} onOpenChange={setIsAddingUser}>
            <SheetTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle className="text-center">Add New User</SheetTitle>
                <SheetDescription className="text-center">
                  Create a new user and assign roles.
                </SheetDescription>
              </SheetHeader>
              <NewUserForm roles={roles} onSave={handleCreateUser} onCancel={() => setIsAddingUser(false)} />
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
              className="pl-8 text-center"
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
                  className="text-center"
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
                <TableHead className="text-center align-middle">
                  Username
                </TableHead>
                <TableHead className="text-center align-middle">
                  Full Name
                </TableHead>
                <TableHead className="text-center align-middle">
                  Title
                </TableHead>
                {roles.map((role) => (
                  <TableHead key={role.id} className="text-center align-middle">
                    {role.name}
                  </TableHead>
                ))}
                <TableHead className="text-center align-middle">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className={!user.active ? "opacity-60" : ""}
                  >
                    <TableCell className="text-center align-middle">
                      <div className="flex items-center justify-center">
                        <span>{user.username}</span>
                        {!user.active && (
                          <Badge
                            variant="outline"
                            className="ml-2 text-red-500 border-red-200"
                          >
                            Disabled
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center align-middle">
                      {user.fullname}
                    </TableCell>
                    <TableCell className="text-center align-middle">
                      <Badge variant="outline">{user.title}</Badge>
                    </TableCell>
                    {roles.map((role) => (
                      <TableCell
                        key={role.id}
                        className="text-center align-middle"
                      >
                        <div className="flex items-center justify-center h-full">
                          {user.roles?.[role.name] ? (
                            <CircleCheckIcon className="text-green-600" />
                          ) : (
                            <CircleXIcon className="opacity-25" />
                          )}
                        </div>
                      </TableCell>
                    ))}
                    <TableCell className="text-center align-middle">
                      <Sheet
                        open={editingUser?.id === user.id}
                        onOpenChange={(open) => !open && setEditingUser(null)}
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
                            <SheetTitle className="text-center">
                              Edit User
                            </SheetTitle>
                            <SheetDescription className="text-center">
                              Modify user details and roles.
                            </SheetDescription>
                          </SheetHeader>
                          {/* {editingUser && (
                            <UserEditForm
                              user={editingUser}
                              roles={roles}
                              onSave={handleSaveUser}
                              onCancel={() => setEditingUser(null)}
                            />
                          )} */}
                        </SheetContent>
                      </Sheet>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={4 + roles.length}
                    className="text-center align-middle"
                  >
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
