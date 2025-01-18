import { TableCell } from '@/components/ui/table';
import React from 'react';

export default function DetailsTableHead() {
  return (
    <>
      <TableCell className="text-center">Code</TableCell>
      <TableCell className="text-center">Employee Name</TableCell>
      <TableCell className="text-center">Employee Title</TableCell>
      <TableCell className="text-center">Department</TableCell>
      <TableCell className="text-center">Requester</TableCell>
      <TableCell className="text-center">Requester Title</TableCell>
      <TableCell className="text-center">Request Time</TableCell>
      <TableCell className="text-center">Meal</TableCell>
      <TableCell className="text-center">Attendance In</TableCell>
      <TableCell className="text-center">Attendance Out</TableCell>
      <TableCell className="text-center">Notes</TableCell>
    </>
  );
}
