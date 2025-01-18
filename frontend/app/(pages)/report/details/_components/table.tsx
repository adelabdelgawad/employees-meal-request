import { fetchReportDetails } from '@/lib/services/report-details';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Rubik } from 'next/font/google';
import Pagination from './pagination';

const rubik = Rubik({ subsets: ['latin'], weight: ['400', '500', '700'] });

export default async function ReportDetailsTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const { records, totalPages } = await fetchReportDetails({
    query,
    page: currentPage,
  });

  return (
    <div className={`p-4 ${rubik.className}`}>
      <Table className="text-center">
        <TableHeader>
          <TableRow>
            {[
              'Code',
              'Employee Name',
              'Employee Title',
              'Department',
              'Requester',
              'Requester Title',
              'Request Time',
              'Meal',
              'Attendance In',
              'Attendance Out',
              'Notes',
            ].map((header) => (
              <TableCell key={header} className="text-center">
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {records && records.length > 0 ? (
            records.map((row: ReportDetailRecord) => (
              <TableRow key={row.id} className="text-center">
                <TableCell>{row.employee_code || '-'}</TableCell>
                <TableCell>{row.employee_name || '-'}</TableCell>
                <TableCell>{row.employee_title || '-'}</TableCell>
                <TableCell>{row.department || '-'}</TableCell>
                <TableCell>{row.requester_name || '-'}</TableCell>
                <TableCell>{row.requester_title || '-'}</TableCell>
                <TableCell>{row.request_time || '-'}</TableCell>
                <TableCell>{row.meal || '-'}</TableCell>
                <TableCell>
                  {row.attendance_in.replace('T', ' ') || '-'}
                </TableCell>
                <TableCell>
                  {row.attendance_out.replace('T', ' ') || '-'}
                </TableCell>
                <TableCell>{row.notes || '-'}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={11} className="text-center">
                No data available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="mt-4 flex justify-center">
        <Pagination totalPages={totalPages} currentPage={currentPage} />
      </div>
    </div>
  );
}
