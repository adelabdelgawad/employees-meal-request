"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Actions from "./_actions/Actions";
import toast from "react-hot-toast";

interface Request {
  id: number;
  requester?: string;
  requester_id?:number;
  requester_title?: string;
  request_time?: string;
  meal?: string;
  status_name?: string;
  status_id?: number;
  closed_time?: string;
  total_lines?: number;
  accepted_lines?: number;
  notes?: string;
}

interface DataTableProps {
  initialData: Request[];
  isAdmin: boolean;
  userId: number;
}


const DataTable: React.FC<DataTableProps> = ({ initialData, isAdmin, userId }) => {
  const [data, setData] = useState<Request[]>(initialData);

  // Update the table data when initialData changes.
  useEffect(() => {
    console.log(initialData)
    setData(initialData);
  }, [initialData]);


  const handleAction = useCallback(
    async (recordId: number, statusId: number) => {
      try {
        const response = await fetch("/api/update-request-status", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: recordId, statusId }),
        });

        if (!response.ok) {
          toast.error(
            `Failed to update request status: ${response.statusText}`
          );
          throw new Error(
            `Failed to update request status: ${response.statusText}`
          );
        }

        const updatedRecord = await response.json();

        if (updatedRecord.status === "error") {
          toast.error(
            `Failed to update request status: ${updatedRecord.message}`
          );
        } else {
          toast.success(updatedRecord.message);
        }

        setData((prevData) =>
          prevData.map((request) =>
            request.id === recordId
              ? { ...request, ...updatedRecord.data }
              : request
          )
        );
      } catch (error) {
        console.error("Failed to update request status:", error);
      }
    },
    []
  );

  /**
   * Handles changes to the request lines by merging the updated fields.
   *
   * @param recordId - The ID of the request record.
   * @param updatedRecord - The fields to update in the record.
   */
  const handleRequestLinesChanges = useCallback(
    async (recordId: number, updatedRecord: Partial<Request>) => {
      setData((prevData) =>
        prevData.map((request) =>
          request.id === recordId ? { ...request, ...updatedRecord } : request
        )
      );
    },
    []
  );

  return (
    <div className="relative overflow-x-auto border border-neutral-200 bg-white">
      <Table className="w-full text-sm text-neutral-700 whitespace-nowrap">
        <TableHeader className="bg-neutral-100 text-xs font-semibold uppercase text-neutral-600">
          <TableRow>
            <TableHead>Requester</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Request Time</TableHead>
            <TableHead>Meal</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Closed Time</TableHead>
            <TableHead>Requests</TableHead>
            <TableHead>Accepted</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.requester ?? "-"}</TableCell>
                <TableCell>{record.requester_title ?? "-"}</TableCell>
                <TableCell>
                  {record.request_time?.replace("T", " ") ?? "-"}
                </TableCell>
                <TableCell>{record.meal ?? "-"}</TableCell>
                <TableCell>{record.status_name ?? "-"}</TableCell>
                <TableCell>
                  {record.closed_time?.replace("T", " ") ?? "-"}
                </TableCell>
                <TableCell>{record.total_lines ?? "-"}</TableCell>
                <TableCell>{record.accepted_lines ?? "-"}</TableCell>
                <TableCell>{record.notes ?? "-"}</TableCell>
                <TableCell>
                <Actions
                  handleRequestLinesChanges={handleRequestLinesChanges}
                  handleAction={handleAction}
                  recordId={record.id}
                  currentStatusId={record.status_id ?? 0}
                  isAdmin={isAdmin}
                  isTheRequester={record.requester_id === userId}
                />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={10} className="text-center">
                No results found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default DataTable;
