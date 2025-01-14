import { TableHead, TableRow } from '@/components/ui/table';

export default function DataTableRowHeader() {
  return (
    <TableRow>
      <TableHead className="text-center">Requester</TableHead>
      <TableHead className="text-center">Title</TableHead>
      <TableHead className="text-center">Request Time</TableHead>

      <TableHead className="text-center">Meal</TableHead>
      <TableHead className="text-center">Status</TableHead>
      <TableHead className="text-center">Closed Time</TableHead>
      <TableHead className="text-center">Requests</TableHead>
      <TableHead className="text-center">Accepted</TableHead>
      <TableHead className="text-center">Notes</TableHead>
      <TableHead className="text-center">Actions</TableHead>
    </TableRow>
  );
}
