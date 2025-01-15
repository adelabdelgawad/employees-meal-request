'use client';

import React, { useEffect, useState } from 'react';
import { Table, TableHeader } from '@/components/ui/table';
import DataTableRowHeader from './_components/_data-table/DataTableRowHeader';
import TableOptions from './_components/_data-table/TableOptions';
import Pagination from '@/components/data-table/Pagination';
import { ReportDetailRecord } from '@/pages/definitions';
import DataTableBody from './_components/_data-table/DataTableBody';
import { useRequest } from '@/hooks/RequestContext';
import { useReportDetail } from '@/hooks/ReportDetailContent';

export default function DetailTable() {
  // State to store requests data
  const { requests } = useReportDetail();

  // Initialize date state to today's date
  const [fromDate, setFromDate] = useState<Date>(new Date());
  const [toDate, setToDate] = useState<Date>(new Date());

  return (
    <div className="w-full overflow-x-auto">
      {/* Table Options and Search Input */}

      {/* Data Table */}
      {/* Data Table */}
      <Table>
        <TableHeader>
          <DataTableRowHeader />
        </TableHeader>
        <DataTableBody records={requests} />
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
