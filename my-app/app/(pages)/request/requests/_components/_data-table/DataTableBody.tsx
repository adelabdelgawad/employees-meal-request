'use client';

import React from 'react';
import { TableBody, TableCell, TableRow } from '@/components/ui/table';
import { ActionButtons } from './ActionButtons';
import { RequestRecord } from '@/pages/definitions';

interface DataTableBodyProps {
  records: RequestRecord[];
}

export default function DataTableBody({ records }: DataTableBodyProps) {
  console.log(records);
  return (
    <TableBody>
      {records.length > 0 ? (
        records.map((record) => (
          <TableRow key={record.id} className="text-center">
            <TableCell>{record?.requester ?? '-'}</TableCell>
            <TableCell>{record?.requester_title ?? '-'}</TableCell>
            <TableCell>
              {record?.request_time
                ? record.request_time.replace('T', ' ')
                : '-'}
            </TableCell>
            <TableCell>{record?.meal ?? '-'}</TableCell>
            <TableCell>{record?.status_name ?? '-'}</TableCell>
            <TableCell>
              {record?.closed_time ? record.closed_time.replace('T', ' ') : '-'}
            </TableCell>
            <TableCell>{record?.total_lines ?? '-'}</TableCell>
            <TableCell>{record?.accepted_lines ?? '-'}</TableCell>

            <TableCell>{record?.notes ?? '-'}</TableCell>
            <TableCell>
              <ActionButtons
                recordId={record?.id}
                requestStatusId={record?.status_id}
              />
            </TableCell>
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
