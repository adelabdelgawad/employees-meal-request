'use client';

import React, { useEffect, useState } from 'react';
import { Table, TableHeader } from '@/components/ui/table';
import DataTableRowHeader from './_components/_data-table/DataTableRowHeader';
import TableOptions from './_components/_data-table/TableOptions';
import Pagination from '@/components/data-table/Pagination';
import DataTableBody from './_components/_data-table/DataTableBody';
import { useSettingUserContext } from '@/hooks/SettingUserContext';
import { AddUserDialog } from './_components/_add-user-dialog/AddUserDialog';

export function SettingUsersTable() {
  // ✅ Use the users array from context
  const { users } = useSettingUserContext();

  const [filteredData, setFilteredData] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [rolesFilter, setRolesFilter] = useState<string[]>([]);

  useEffect(() => {
    let filtered = users;

    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.fullName.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (rolesFilter.length > 0) {
      filtered = filtered.filter((user) =>
        user.roles.some((role) =>
          typeof role === 'string'
            ? rolesFilter.includes(role)
            : rolesFilter.includes(role.name),
        ),
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchQuery, rolesFilter, users]);

  // Pagination calculations
  const totalRows = filteredData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentPageData = filteredData.slice(
    startIndex,
    startIndex + rowsPerPage,
  );

  // Role filter options
  const rolesOptions = users.length
    ? Array.from(
        new Set(
          users.flatMap((user) =>
            user.roles.map((role) =>
              typeof role === 'string' ? role : role.name,
            ),
          ),
        ),
      ).map((role) => ({
        value: role,
        count: users.filter((user) =>
          user.roles.some((r) =>
            typeof r === 'string' ? r === role : r.name === role,
          ),
        ).length,
      }))
    : [];

  return (
    <div className="w-full overflow-x-auto p-2 ">
      <div className="flex justify-between items-center w-full p-1">
        <div className="text-sm">
          <TableOptions
            data={filteredData}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
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

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalRows={totalRows}
        rowsPerPage={rowsPerPage}
        onPageChange={setCurrentPage}
        onRowsPerPageChange={(rows) => {
          setRowsPerPage(rows);
          setCurrentPage(1);
        }}
      />
    </div>
  );
}
