'use client';

import { Rubik } from 'next/font/google';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Loading from './Loading';
import DetailsTableCell from './DetailsTableCell';
import { useEffect, useState } from 'react';
``;
import DetailsTableHead from './DetailsTableHead';
import { fetchReportDetails } from '@/lib/services/report-details';
import DataTablePagination from './DataTablePagination';

// Apply Rubik font
const rubik = Rubik({ subsets: ['latin'], weight: ['400', '500', '700'] });

export default function DetailsTable() {
  const [data, setData] = useState<ReportDetailRecord[]>([]);
  const [loading, setLoading] = useState(true); // Add a loading state

  useEffect(() => {
    const updateData = async () => {
      setLoading(true); // Start loading
      const updatedData = await fetchReportDetails(); // Fetch data();
      setData(updatedData);
      setLoading(false); // End loading
    };

    updateData();
  }, []);

  return (
    <div className={`p-4 ${rubik.className}`}>
      <Table className="text-center">
        <TableHeader>
          <TableRow>
            <DetailsTableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            // Show skeleton while loading
            <Loading rows={11} columns={11} />
          ) : data && data.length > 0 ? (
            // Show data if available
            data.map((row) => <DetailsTableCell key={row.id} row={row} />)
          ) : (
            // Show "No data available" if no data after loading
            <TableRow>
              <TableCell colSpan={11} className="text-center">
                No data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <DataTablePagination />
    </div>
  );
}
