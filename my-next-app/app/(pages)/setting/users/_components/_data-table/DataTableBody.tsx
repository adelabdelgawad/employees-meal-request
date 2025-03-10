'use client';

import React from 'react';
import { TableBody, TableCell, TableRow } from '@/components/ui/table';
import ActionButtons from './ActionButtons';

interface DataTableBodyProps {
  records: User[];
}

export default function DataTableBody({ records }: DataTableBodyProps) {
  return (
    <TableBody>
      {records.length > 0 ? (
        records.map((record) => (
          <TableRow key={record.id} className="text-center">
            <TableCell>{record.username}</TableCell>
            <TableCell>{record.fullname}</TableCell>
            <TableCell>{record.title}</TableCell>
            <TableCell>
              {Array.isArray(record.roles)
                ? record.roles
                    .map((role) =>
                      typeof role === 'string' ? role : (role as { name: string }).name,
                    )
                    .join(', ')
                : ''}
            </TableCell>
            <TableCell>
              <div className="flex justify-center">
                <ActionButtons recordId={record.id} />
              </div>
            </TableCell>
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={5} className="text-center text-gray-500">
            No users found.
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );
}
