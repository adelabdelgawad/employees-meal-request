// components/RequestLinesTable.tsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DeleteRequestLine from "./DeleteRequestLine";
import { getRequestLines } from "@/lib/services/request-lines";
import { Skeleton } from "@/components/ui/skeleton";

interface RequestLinesTableProps {
  requestId: number;
  onDelete: (id: number) => void;
  onUndo: (id: number) => void;
  disabled?: boolean;
}

// Custom hook for data fetching
const useRequestLines = (requestId: number) => {
  const [requestLines, setRequestLines] = useState<RequestLine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequestLines = async () => {
      setIsLoading(true);
      try {
        const response = await getRequestLines(requestId);
        setRequestLines(response || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch request lines");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequestLines();
  }, [requestId]);

  return { requestLines, isLoading, error };
};

export default function RequestLinesTable({
  requestId,
  onDelete,
  onUndo,
  disabled = false,
}: RequestLinesTableProps) {
  const { requestLines, isLoading, error } = useRequestLines(requestId);

  // Loading skeleton
  const LoadingSkeleton = () => (
    <>
      {[...Array(3)].map((_, index) => (
        <TableRow key={index}>
          {[...Array(9)].map((_, cellIndex) => (
            <TableCell key={cellIndex}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Title</TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Notes</TableHead>
          <TableHead>Attendance In</TableHead>
          <TableHead>Shift Hours</TableHead>
          <TableHead>Approved</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <LoadingSkeleton />
        ) : requestLines.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} className="text-center py-4">
              No request lines found
            </TableCell>
          </TableRow>
        ) : (
          requestLines.map((requestLine) => (
            <TableRow
              key={requestLine.id}
              className={requestLine.is_deleted ? "line-through text-gray-500" : ""}
            >
              <TableCell>{requestLine.id}</TableCell>
              <TableCell>{requestLine.name}</TableCell>
              <TableCell>{requestLine.title}</TableCell>
              <TableCell>{requestLine.code}</TableCell>
              <TableCell>{requestLine.notes}</TableCell>
              <TableCell>
                {requestLine.attendance_in
                  ? new Date(requestLine.attendance_in).toLocaleString()
                  : "N/A"}
              </TableCell>
              <TableCell>{requestLine.shift_hours}</TableCell>
              <TableCell>{requestLine.is_accepted ? "Yes" : "No"}</TableCell>
              <TableCell>
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