import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";

export default function DataTable({ data }: { data: any[] }) {
  return (
    <div className="relative overflow-x-auto border border-neutral-200 bg-white">
      <Table className="w-full text-sm text-neutral-700 whitespace-nowrap">
        <TableHeader className="bg-neutral-100 text-xs font-semibold uppercase text-neutral-600">
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
        </TableHeader>
        <TableBody>
          {data && data.length > 0 ? (
            data.map((record) => (
              <TableRow key={record.id} className="text-center">
                <TableCell>{record?.requester ?? "-"}</TableCell>
                <TableCell>{record?.requester_title ?? "-"}</TableCell>
                <TableCell>
                  {record?.request_time
                    ? record.request_time.replace("T", " ")
                    : "-"}
                </TableCell>
                <TableCell>{record?.meal ?? "-"}</TableCell>
                <TableCell>{record?.status_name ?? "-"}</TableCell>
                <TableCell>
                  {record?.closed_time
                    ? record.closed_time.replace("T", " ")
                    : "-"}
                </TableCell>
                <TableCell>{record?.total_lines ?? "-"}</TableCell>
                <TableCell>{record?.accepted_lines ?? "-"}</TableCell>

                <TableCell>{record?.notes ?? "-"}</TableCell>
                <TableCell>
                  {/* <ActionButtons
                    recordId={record?.id}
                    requestStatusId={record?.status_id}
                  /> */}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center">
                No results found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
