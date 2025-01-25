"use client";
import React, { useState, useEffect } from "react";
import ExportTable from "@/components/data-table/DataTableExport";
import DataTableSearch from "@/components/data-table/DataTableSearch";
import { AddUser } from "./_add-user/AddUser";
import { fetchDomainUsers, fetchRoles } from "@/lib/services/setting-user";

interface Role {
  id: number;
  name: string;
}

interface User {
  id: number;
  fullName?: string;
  username?: string;
  title?: string;
  roles?: Role[];
}

interface DataTableHeaderProps {
  initialData: User[];
  onSearch: (query: string) => void; // Callback for search functionality
}

export default function DataTableHeader({
  initialData,
  onSearch,
}: DataTableHeaderProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [domainUsers, setDomainUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [rolesData, usersData] = await Promise.all([
          fetchRoles(),
          fetchDomainUsers(),
        ]);
        setRoles(rolesData);
        setDomainUsers(usersData);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch data");
        setLoading(false);
        console.error(err);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex items-center justify-between bg-white mb-5 p-4 border-b border-gray-200">
      <div className="flex items-center gap-4">
        <DataTableSearch placeholder="Search Username..." onSearch={onSearch} />
      </div>
      <div className="flex items-center gap-4">
        <AddUser
          domainUsers={domainUsers}
          roles={roles}
          onUserAdded={() => {}}
        />
        <ExportTable data={initialData} />
      </div>
    </div>
  );
}
