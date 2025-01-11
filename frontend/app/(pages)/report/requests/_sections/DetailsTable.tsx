"use client";

import React, { useEffect, useState } from "react";
import { Table, TableHeader } from "@/components/ui/table";

import DataTableRowHeader from "../_components/_dashboard-table/DataTableRowHeader";
import TableOptions from "../_components/_dashboard-table/TableOptions";
import DataTableBody from "../_components/_dashboard-table/DataTableBody";
import Pagination from "@/components/data-table/Pagination";
import { DashboardRecord } from "@/pages/definitions";

interface DetailsTableProps {
  records: DashboardRecord[];
}

const DetailsTable: React.FC<DetailsTableProps> = ({ records }) => {
  // State to store requests data
  const [filteredData, setFilteredData] = useState<DashboardRecord[]>(records);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  // Handle filtering
  useEffect(() => {
    let filtered = records;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((record) =>
        record.department.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status_name filter
    if (statusFilter.length > 0) {
      filtered = filtered.filter((record) =>
        statusFilter.includes(record.department)
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page after filtering
  }, [searchQuery, statusFilter, records]);

  // Pagination logic
  const totalRows = filteredData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentPageData = filteredData.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  return (
    <div className="w-full overflow-x-auto">
      {/* Table Options and Search Input */}
      <div className="p-2">
        <TableOptions
          data={filteredData}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
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
          setCurrentPage(1); // Reset to first page on rows per page change
        }}
      />
    </div>
  );
};

export default DetailsTable;
