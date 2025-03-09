import { TableHead, TableRow } from '@/components/ui/table';

export default function DataTableRowHeader() {
  return (
    <TableRow>
      <TableHead className="text-center">Username</TableHead>
      <TableHead className="text-center">Full Name</TableHead>
      <TableHead className="text-center">Title</TableHead>
      <TableHead className="text-center">Roles</TableHead>
      <TableHead className="text-center">Actions</TableHead>
    </TableRow>
  );
}
