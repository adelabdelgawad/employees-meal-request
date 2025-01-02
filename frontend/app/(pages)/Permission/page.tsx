"use client";

import React, { useEffect, useState } from "react";
import UserTable from "./components/UserTable";
import { fetchRoles, fetchUsers, Role, User } from "../../../utils/api"; // Import API functions
import DashboardCards from "./components/dashboard";

export default function Permission() {
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Fetch available roles
  useEffect(() => {
    const getRoles = async () => {
      try {
        const roles = await fetchRoles();
        setAvailableRoles(roles);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };

    getRoles();
  }, []);

  // Fetch users with permissions
  useEffect(() => {
    const getUsers = async () => {
      try {
        const users = await fetchUsers();
        setUsers(users);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    getUsers();
  }, []);

  return (
    <div>
      <DashboardCards />
      <UserTable roles={availableRoles} users={users} setUsers={setUsers} />
    </div>
  );
}
