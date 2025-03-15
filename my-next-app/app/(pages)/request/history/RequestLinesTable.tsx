// components/RequestLinesTable.tsx
"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DeleteRequestLine from "./_actions/DeleteRequestLine";
import TableSkeleton from "@/components/TableSkeleton";

interface RequestLinesTableProps {
  onDelete: (id: number) => void;
  onUndo: (id: number) => void;
  disabled: boolean;
  initialRequestLines: RequestLine[];
  loading: boolean;
}

export default function RequestLinesTable({
  onDelete,
  onUndo,
  disabled,
  initialRequestLines,
  loading,
}: RequestLinesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-center">ID</TableHead>
          <TableHead className="text-center">Name</TableHead>
          <TableHead className="text-center">Title</TableHead>
          <TableHead className="text-center">Code</TableHead>
          <TableHead className="text-center">Notes</TableHead>
          <TableHead className="text-center">Attendance In</TableHead>
          <TableHead className="text-center">Shift Hours</TableHead>
          <TableHead className="text-center">Approved</TableHead>
          <TableHead className="text-center">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          <TableSkeleton />
        ) : initialRequestLines.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} className="text-center py-4">
              No request lines found
            </TableCell>
          </TableRow>
        ) : (
          initialRequestLines.map((requestLine) => (
            <TableRow
              key={requestLine.id}
              className={requestLine.is_deleted ? "line-through text-gray-500" : ""}
            >
              <TableCell className="text-center">{requestLine.id}</TableCell>
              <TableCell className="text-center">{requestLine.name}</TableCell>
              <TableCell className="text-center">{requestLine.title}</TableCell>
              <TableCell className="text-center">{requestLine.code}</TableCell>
              <TableCell className="text-center">{requestLine.notes}</TableCell>
              <TableCell className="text-center">
                {requestLine.attendance_in
                  ? new Date(requestLine.attendance_in).toLocaleString()
                  : "N/A"}
              </TableCell>
              <TableCell className="text-center">{requestLine.shift_hours}</TableCell>
              <TableCell className="text-center">
                {requestLine.is_accepted ? "Yes" : "No"}
              </TableCell>
              <TableCell className="text-center">
                <DeleteRequestLine
                  disabled={disabled}
                  requestLine={requestLine}
                  onDelete={onDelete}
                  onUndo={onUndo}
                />
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
