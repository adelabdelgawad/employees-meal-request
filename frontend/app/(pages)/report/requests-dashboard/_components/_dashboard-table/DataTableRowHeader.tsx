import { TableHead, TableRow } from '@/components/ui/table';

export default function DataTableRowHeader() {
  return (
    <TableRow>
      <TableHead className="text-center">Departmnet</TableHead>
      <TableHead className="text-center">Dinner Requests</TableHead>
      <TableHead className="text-center">Lunch Requests</TableHead>
    </TableRow>
  );
}
