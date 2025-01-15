'use client';

import React from 'react';
import { TableBody, TableCell, TableRow } from '@/components/ui/table';

interface DataTableBodyProps {
  records: ReportDetailRecord[];
}

export default function DataTableBody({ records }: DataTableBodyProps) {
  console.log(records);
  return (
    <TableBody>
      {records.length > 0 ? (
        records.map((record) => (
          <TableRow key={record.id} className="text-center">
            <TableCell>{record?.code ?? '-'}</TableCell>
            <TableCell>{record?.name ?? '-'}</TableCell>
            <TableCell>{record?.title ?? '-'}</TableCell>
            <TableCell>{record?.department_name ?? '-'}</TableCell>
            <TableCell>{record?.requester_name ?? '-'}</TableCell>
            <TableCell>{record?.requester_title ?? '-'}</TableCell>
            <TableCell>
              {record?.request_time ? record.request_time('T', ' ') : '-'}
            </TableCell>
            <TableCell>{record?.meal_type ?? '-'}</TableCell>
            <TableCell>
              {record?.request_time ? record.attendance_in('T', ' ') : '-'}
            </TableCell>
            <TableCell>
              {record?.request_time ? record.attendance_out('T', ' ') : '-'}
            </TableCell>
            <TableCell>{record?.hours ?? '-'}</TableCell>
            <TableCell>{record?.notes ?? '-'}</TableCell>
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
