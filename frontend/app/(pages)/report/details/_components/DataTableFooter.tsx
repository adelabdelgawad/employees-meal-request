import React from 'react';
import TablePagination from './TablePagination';

interface TablePaginationProps {
  searchParams?: { query?: string; page?: string; page_size?: string }; // Add a type for searchParams
  rowsPerPage: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  totalRows: number;
}

export default function DataTableFooter({
  searchParams = {},
  pageSize,
  currentPage,
  totalPages,
  rowsPerPage,
  totalRows,
}: TablePaginationProps) {
  return (
    <div>
      {' '}
      <TablePagination
        searchParams={searchParams}
        rowsPerPage={pageSize}
        totalRows={totalRows}
        totalPages={totalPages}
      />
    </div>
  );
}
