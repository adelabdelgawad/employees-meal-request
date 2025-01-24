import React from "react";
import TablePagination from "./TablePagination";
import ShowRowsPerPage from "./ShowRowsPerPage";

interface DataTableFooterProps {
  searchParams?: { query?: string; page?: string; page_size?: string };
  rowsPerPage: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  totalRows: number;
}

export function DataTableFooter({
  currentPage = 1,
  totalPages = 1,
  rowsPerPage = 10,
  totalRows,
}: DataTableFooterProps) {
  return (
    <div className="flex justify-between items-center">
      {/* Rows per page selector */}
      <div>
        <ShowRowsPerPage rowsPerPage={rowsPerPage} />
      </div>

      {/* Pagination Controls */}
      <div>
        <TablePagination totalPages={totalPages} />
      </div>

      {/* Page and Total Rows Info */}
      <div>
        <span className="text-sm">
          Page {currentPage} of {totalPages} — Total rows: {totalRows}
        </span>
      </div>
    </div>
  );
}
