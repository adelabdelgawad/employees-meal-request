/**
 * @file data-table.tsx
 * @description Components for rendering the table data or showing an error message if the fetch fails.
 */

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

/**
 * Renders the main data table with ID, name, and description columns.
 *
 * @param {any[]} items - An array of data objects to display.
 * @returns {JSX.Element} The rendered table.
 */
function DataTableBody({ items }: { items: any[] }) {
  return (
    <div className="relative overflow-x-auto shadow-md border border-neutral-200 rounded-lg bg-white">
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
          {items && items.length > 0 ? (
            items.map((item) => (
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

/**
 * A simple error state table to show when data fails to load.
 *
 * @returns {JSX.Element} A rendered error message component.
 */
function ErrorDataTableBody() {
  return (
    <div className="text-center text-red-600 mt-4 bg-red-50 p-4 rounded border border-red-300">
      Failed to get data. Please try again later.
    </div>
  );
}

export { DataTableBody, ErrorDataTableBody };
