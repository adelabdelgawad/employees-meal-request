import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';

interface TableRowsProps {
  row: ReportDetailsData;
}

export default function DetailsTableCell({ row }: TableRowsProps) {
  console.log(row);
  return (
    <TableRow key={row.id} className="text-center">
      <TableCell>{row.employee_code || '-'}</TableCell>
      <TableCell>{row.employee_name || '-'}</TableCell>
      <TableCell>{row.employee_title || '-'}</TableCell>
      <TableCell>{row.department || '-'}</TableCell>
      <TableCell>{row.requester_name || '-'}</TableCell>
      <TableCell>{row.requester_title || '-'}</TableCell>
      <TableCell>{row.request_time || '-'}</TableCell>
      <TableCell>{row.meal || '-'}</TableCell>
      <TableCell>{row.attendance_in || '-'}</TableCell>
      <TableCell>{row.attendance_out || '-'}</TableCell>
      <TableCell>{row.notes || '-'}</TableCell>
    </TableRow>
  );
}
