'use client';

import React, { useEffect, useState } from 'react';
import { Table, TableHeader } from '@/components/ui/table';
import DataTableRowHeader from './_components/_data-table/DataTableRowHeader';
import TableOptions from './_components/_data-table/TableOptions';
import Pagination from '@/components/data-table/Pagination';
import DataTableBody from './_components/_data-table/DataTableBody';
import { useSettingUserContext } from '@/hooks/SettingUserContext';

export function SettingUsersTable() {
  // State to store users data
  const { users } = useSettingUserContext();

  const [filteredData, setFilteredData] = useState<User[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [rolesFilter, setRolesFilter] = useState<string[]>([]);

  // Handle filtering
  useEffect(() => {
    let filtered = users;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.fullName.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Apply roles filter
    if (rolesFilter.length > 0) {
      filtered = filtered.filter((user) =>
        user.roles.some((role) => rolesFilter.includes(role)),
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page after filtering
  }, [searchQuery, rolesFilter, users]);

  // Pagination logic
  const totalRows = filteredData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentPageData = filteredData.slice(
    startIndex,
    startIndex + rowsPerPage,
  );

  // Extract unique values for roles filter
  const rolesOptions = users.length
    ? Array.from(new Set(users.flatMap((user) => user.roles))).map((role) => ({
        value: role,
        count: users.filter((user) => user.roles.includes(role)).length,
      }))
    : [];

  return (
    <div className="w-full overflow-x-auto">
      {/* Table Options and Search Input */}
      <div className="p-2">
        <TableOptions
          data={filteredData}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          rolesFilter={rolesFilter}
          setRolesFilter={setRolesFilter}
          rolesOptions={rolesOptions} // ✅ Pass this correctly
        />
      </div>

      {/* Data Table */}
      <Table>
        <TableHeader>
          <DataTableRowHeader />
        </TableHeader>
        <DataTableBody records={currentPageData} />
      </Table>

      {/* Pagination */}
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
