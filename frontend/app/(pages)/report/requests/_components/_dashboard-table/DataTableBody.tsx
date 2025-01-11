"use client";

import React from "react";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { ActionButtons } from "./ActionButtons";
import { DashboardRecord } from "@/pages/definitions";

interface DataTableBodyProps {
  records: DashboardRecord[];
}

export default function DataTableBody({ records }: DataTableBodyProps) {
  console.log(records);
  return (
    <TableBody>
      {records.length > 0 ? (
        records.map((record) => (
          <TableRow key={record.id} className="text-center">
            <TableCell>{record?.id}</TableCell>
            <TableCell>{record?.department}</TableCell>
            <TableCell>{record?.dinnerRequests ?? 0}</TableCell>
            <TableCell>{record?.lunchRequests ?? 0}</TableCell>
            <TableCell>
              <span>Action</span>
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
  );
}
