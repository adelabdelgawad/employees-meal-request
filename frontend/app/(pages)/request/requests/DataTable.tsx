"use client";

import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Table, TableHeader } from "@/components/ui/table";
import DataTableRowHeader from "./_components/_data-table/DataTableRowHeader";
import TableOptions from "./_components/_data-table/TableOptions";
import DataTableBody from "./_components/_data-table/DataTableBody";
import Pagination from "@/components/data-table/Pagination";
import { RequestRecord } from "@/pages/definitions";
import { getRequests } from "@/app/_lib/data-fetcher";
import { useDataTable } from "./_components/_data-table/DataTableContext";

export function DataTable() {
  // State to store requests data
  const { requests } = useDataTable();

  const [filteredData, setFilteredData] = useState<RequestRecord[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  // Initialize date state to today's date
  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [toDate, setToDate] = useState<Date>(new Date());

  // Handle filtering
  useEffect(() => {
    let filtered = requests;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter((record) =>
        record.requester.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status_name filter
    if (statusFilter.length > 0) {
      filtered = filtered.filter((record) =>
        statusFilter.some((status) =>
          record.status_name.toLowerCase().includes(status.toLowerCase())
        )
      );
    }

    setFilteredData(filtered);
    setCurrentPage(1); // Reset to first page after filtering
  }, [searchQuery, statusFilter, requests]);

  // Pagination logic
  const totalRows = filteredData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentPageData = filteredData.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  // Extract unique values for status_name filter
  const uniqueStatusOptions = Array.from(
    new Set(requests.map((r) => r.status_name))
  ).map((status_name) => ({
    value: status_name,
    count: requests.filter((r) => r.status_name === status_name).length,
  }));

  return (
    <div className="w-full overflow-x-auto">
      {/* Table Options and Search Input */}
      <div className="p-2">
        <TableOptions
          data={filteredData}
          fromDate={fromDate}
          toDate={toDate}
          setFromDate={setFromDate}
          setToDate={setToDate}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          statusOptions={uniqueStatusOptions} // ✅ Fixed: Pass statusOptions prop
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
}
