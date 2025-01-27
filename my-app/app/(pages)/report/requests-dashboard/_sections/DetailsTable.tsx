"use client";

import React, { useEffect, useState, Suspense } from "react";
import { Table, TableHeader } from "@/components/ui/table";

import TablePagination from "@/components/data-table/TablePagination";

interface DetailsTableProps {
  records: ReportRequestRecord[];
}

const DetailsTableContent: React.FC<DetailsTableProps> = ({ records }) => {
  // Initialize filteredData with records or an empty array
  const [filteredData, setFilteredData] = useState<ReportRequestRecord[]>([]);
  const [currentPageData, setCurrentPageData] = useState<ReportRequestRecord[]>(
    []
  );

  // Update filteredData when records change
  useEffect(() => {
    if (records.length > 0) {
      setFilteredData(records);
    }
  }, [records]);

  // Pagination logic
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);

  // Update currentPageData when filteredData or pagination changes
  useEffect(() => {
    const totalRows = filteredData.length;
    const startIndex = (currentPage - 1) * rowsPerPage;
    const newPageData = filteredData.slice(
      startIndex,
      startIndex + rowsPerPage
    );
    setCurrentPageData(newPageData);
  }, [filteredData, currentPage, rowsPerPage]);

  console.log("Filtered Data:", filteredData);
  console.log("Current Page Data:", currentPageData);

  // Total Rows and Pages Calculation
  const totalRows = filteredData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);

  return <div className="w-full overflow-x-auto">{/* Data Table */}</div>;
};

const DetailsTable: React.FC<DetailsTableProps> = ({ records }) => {
  return (
    <Suspense fallback={<div>Loading table data...</div>}>
      <DetailsTableContent records={records} />
    </Suspense>
  );
};

export default DetailsTable;
