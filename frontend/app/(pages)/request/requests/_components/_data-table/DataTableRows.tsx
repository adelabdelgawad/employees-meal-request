import React from "react";
import { useDataTable } from "./DataTableContext";
import { TableCell, TableRow } from "@/components/ui/table";
import { ActionButtons } from "./ActionButtons";

export default function DataTableRows() {
  const { table } = useDataTable();

  // ✅ Get paginated rows
  const rows = table.getPaginationRowModel().rows;

  return (
    <>
      {rows.map((row) => (
        <TableRow key={row.id} className="text-center">
          <TableCell>{row.original?.requester || "-"}</TableCell>
          <TableCell>{row.original?.requester_title || "-"}</TableCell>
          <TableCell>
            {row.original?.request_time
              ? row.original.request_time.replace("T", " ")
              : "-"}
          </TableCell>
          <TableCell>{row.original?.meal_type || "-"}</TableCell>
          <TableCell>{row.original?.status_name || "-"}</TableCell>
          <TableCell>
            {row.original?.closed_time
              ? row.original.closed_time.replace("T", " ")
              : "-"}
          </TableCell>
          <TableCell>{row.original?.notes || "-"}</TableCell>
          <TableCell>
            <ActionButtons
              rowId={row.original?.id}
              requestStatusId={row.original?.status_id}
            />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
