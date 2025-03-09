"use client";

import React, { useEffect, useState } from "react";
import { Table, TableHeader } from "@/components/ui/table";
import DataTableRowHeader from "./_components/_data-table/DataTableRowHeader";
import TableOptions from "./_components/_data-table/TableOptions";
import DataTableBody from "./_components/_data-table/DataTableBody";
import { useSettingUserContext } from "@/hooks/SettingUserContext";
import { AddUserDialog } from "./_components/_add-user-dialog/AddUserDialog";
import TablePagination from "@/components/data-table/TablePagination";

export function SettingUsersTable() {
  // ✅ Use the users array from context
  const { users } = useSettingUserContext();

  const [filteredData, setFilteredData] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rolesFilter, setRolesFilter] = useState<string[]>([]);
  
  const rowsPerPage: number = 10

  useEffect(() => {
    let filtered = users;

    if (rolesFilter.length > 0) {
      filtered = filtered.filter((user) =>
        user.roles.some((role) =>
          typeof role === "string"
            ? rolesFilter.includes(role)
            : rolesFilter.includes((role as { name: string }).name)
        )
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [rolesFilter, users]);

  // Pagination calculations
  const totalRows = filteredData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentPageData = filteredData.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  // Role filter options
  const rolesOptions = users.length
    ? Array.from(
        new Set(
          users.flatMap((user) =>
            user.roles.map((role) =>
              typeof role === "string" ? role : (role as { name: string }).name
            )
          )
        )
      ).map((role) => ({
        value: role,
        count: users.filter((user) =>
          user.roles.some((r) =>
            typeof r === "string" ? r === role : (r as { name: string }).name === role
          )
        ).length,
      }))
    : [];

  return (
    <div className="w-full overflow-x-auto p-2 ">
      <div className="flex justify-between items-center w-full p-1">
        <div className="text-sm">
          <TableOptions
            rolesFilter={rolesFilter}
            setRolesFilter={setRolesFilter}
            rolesOptions={rolesOptions}
          />
        </div>
        <div className="text-sm">
          <AddUserDialog />
        </div>
      </div>

      <Table className="mt-5">
        <TableHeader>
          <DataTableRowHeader />
        </TableHeader>
        <DataTableBody records={currentPageData} />
      </Table>

      <TablePagination
        totalPages={totalPages}
      />
    </div>
  );
}
