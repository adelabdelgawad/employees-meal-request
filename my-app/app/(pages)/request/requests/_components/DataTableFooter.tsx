import React from "react";
import TablePagination from "@/components/data-table/TablePagination";
import ShowRowsPerPage from "@/components/data-table/ShowRowsPerPage";

interface DataTableFooterProps {
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
