'use client';

import React, { useEffect, useState } from 'react';
import { Table, TableHeader } from '@/components/ui/table';
import Pagination from '@/components/data-table/Pagination';
import { RequestRecord } from '@/pages/definitions';
import { useRequest } from '@/hooks/RequestContext';
import TableOptions from './_components/_data-table/TableOptions';
import DataTableRowHeader from './_components/_data-table/DataTableRowHeader';
import DataTableBody from './_components/_data-table/DataTableBody';

export function DetailsTable() {
  // State to store requests data

  return (
    <div className="w-full overflow-x-auto">
      {/* Table Options and Search Input */}

      {/* Data Table */}
      {/* Data Table */}
      <Table>
        <TableHeader>
          <DataTableRowHeader />
        </TableHeader>
      </Table>
    </div>
  );
}
