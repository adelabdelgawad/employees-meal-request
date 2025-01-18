import { Skeleton } from '@/components/ui/skeleton';
import { TableBody, TableCell, TableRow } from '@/components/ui/table';

interface LoadingProps {
  rows: number; // Number of rows to render
  columns: number; // Number of columns to render
}

export default function Loading({ rows, columns }: LoadingProps) {
  return (
    <>
      {[...Array(rows)].map((_, rowIdx) => (
        <TableRow key={rowIdx}>
          {[...Array(columns)].map((_, cellIdx) => (
            <TableCell key={cellIdx}>
              <Skeleton className="h-[20px] w-[100px] mx-auto rounded-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
