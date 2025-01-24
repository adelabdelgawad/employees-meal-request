import React from 'react';
import TablePagination from './TablePagination';
import ShowRowsPerPage from './ShowRowsPerPage';

interface TablePaginationProps {
  searchParams?: { query?: string; page?: string; page_size?: string };
  rowsPerPage: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  totalRows: number;
}

export default function DataTableFooter({
  searchParams = {},
  currentPage,
  totalPages,
  rowsPerPage,
  totalRows,
}: TablePaginationProps) {
  return (
    <div className="flex justify-between items-center">
      {/* Rows per page selector */}
      <div>
        <ShowRowsPerPage rowsPerPage={rowsPerPage} />
      </div>

      <div>
        {/* Pagination Controls */}
        <TablePagination searchParams={searchParams} totalPages={totalPages} />
      </div>

      <div>
        <span className="text-sm">
          Page {currentPage} of {totalPages} — Total rows: {totalRows}
        </span>
      </div>
    </div>
  );
}
