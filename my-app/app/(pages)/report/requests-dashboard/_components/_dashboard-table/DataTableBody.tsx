'use client';

import React from 'react';
import { TableBody, TableCell, TableRow } from '@/components/ui/table';
import { ActionButtons } from './ActionButtons';

interface DataTableBodyProps {
  records: ReportRequestRecord[];
}

export default function DataTableBody({ records }: DataTableBodyProps) {
  return (
    <TableBody>
      {records.length > 0 ? (
        records.map((record) => (
          <TableRow key={record.id} className="text-center">
            <TableCell>{record?.department}</TableCell>
            <TableCell>{record?.dinnerRequests ?? 0}</TableCell>
            <TableCell>{record?.lunchRequests ?? 0}</TableCell>
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={8} className="text-center">
            No results found.
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
}
