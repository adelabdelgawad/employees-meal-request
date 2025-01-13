'use client';

import React from 'react';
import { TableBody, TableCell, TableRow } from '@/components/ui/table';
import ActionButtons from './ActionButtons';

interface DataTableBodyProps {
  records: User[];
}

export default function DataTableBody({ records }: DataTableBodyProps) {
  console.log(records);
  return (
    <TableBody>
      {records.length > 0 ? (
        records.map((record) => (
          <TableRow key={record.id} className="text-center">
            <TableCell>{record.username}</TableCell>
            <TableCell>{record.fullName}</TableCell>
            <TableCell>{record.title}</TableCell>
            <TableCell>
              {Array.isArray(record.roles) ? record.roles.join(', ') : ''}
            </TableCell>
            <TableCell>
              <ActionButtons recordId={record.id} />
            </TableCell>
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={5} className="text-center">
            No results found.
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
}
