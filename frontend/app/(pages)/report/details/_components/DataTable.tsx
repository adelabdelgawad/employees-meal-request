import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import React from 'react';

export default function DataTable({ data }: { data: any[] }) {
  console.log(data); // Debugging to ensure data is passed correctly

  return (
    <div className="relative overflow-x-auto border border-neutral-200 bg-white">
      <Table className="w-full text-sm text-neutral-700 whitespace-nowrap">
        <TableHeader className="bg-neutral-100 text-xs font-semibold uppercase text-neutral-600">
          <TableRow>
            <TableCell className="px-4 py-2 text-center">Code</TableCell>
            <TableCell className="px-4 py-2 text-center">
              Employee Name
            </TableCell>
            <TableCell className="px-4 py-2 text-center">
              Employee Title
            </TableCell>
            <TableCell className="px-4 py-2 text-center">Department</TableCell>
            <TableCell className="px-4 py-2 text-center">Requester</TableCell>
            <TableCell className="px-4 py-2 text-center">
              Requester Title
            </TableCell>
            <TableCell className="px-4 py-2 text-center">
              Request Time
            </TableCell>
            <TableCell className="px-4 py-2 text-center">Meal</TableCell>
            <TableCell className="px-4 py-2 text-center">
              Attendance In
            </TableCell>
            <TableCell className="px-4 py-2 text-center">
              Attendance Out
            </TableCell>
            <TableCell className="px-4 py-2 text-center">Notes</TableCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data && data.length > 0 ? (
            data.map((item) => (
              <TableRow
                key={item.id}
                className="hover:bg-neutral-50 text-neutral-700"
              >
                <TableCell className="px-4 py-2 text-center">
                  {item.employee_code || '-'}
                </TableCell>
                <TableCell className="px-4 py-2 text-center">
                  {item.employee_name || '-'}
                </TableCell>
                <TableCell className="px-4 py-2 text-center">
                  {item.employee_title || '-'}
                </TableCell>
                <TableCell className="px-4 py-2 text-center">
                  {item.department || '-'}
                </TableCell>
                <TableCell className="px-4 py-2 text-center">
                  {item.requester_name || '-'}
                </TableCell>
                <TableCell className="px-4 py-2 text-center">
                  {item.requester_title || '-'}
                </TableCell>
                <TableCell className="px-4 py-2 text-center">
                  {item.request_time || '-'}
                </TableCell>
                <TableCell className="px-4 py-2 text-center">
                  {item.meal || '-'}
                </TableCell>
                <TableCell className="px-4 py-2 text-center">
                  {item.attendance_in || '-'}
                </TableCell>
                <TableCell className="px-4 py-2 text-center">
                  {item.attendance_out || '-'}
                </TableCell>
                <TableCell className="px-4 py-2 text-center">
                  {item.notes || '-'}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={11}
                className="px-4 py-4 text-center text-neutral-500 italic"
              >
                No data found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
