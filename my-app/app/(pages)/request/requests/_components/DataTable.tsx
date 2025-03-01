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
import clientAxiosInstance from "@/lib/clientAxiosInstance";

interface Request {
  id: number;
  requester?: string;
  requester_id?: number;
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

const DataTable: React.FC<DataTableProps> = ({
  initialData,
  isAdmin,
  userId,
}) => {
  const [data, setData] = useState<Request[]>(initialData);

  // Update the table data when initialData changes.
  useEffect(() => {
    console.log(initialData);
    setData(initialData);
  }, [initialData]);

  const handleAction = useCallback(
    async (recordId: number, statusId: number) => {
      try {
        const data = {
          request_id: recordId,
          status_id: statusId,
        };

        const response = await clientAxiosInstance.put(
          `/update-request-status`,
          data
        );
        toast.success("Request Status updated successfully!");

        const updatedRecord = await response.data;

        setData((prevData) =>
          prevData.map((request) =>
            request.id === recordId
              ? { ...request, ...updatedRecord.data }
              : request
          )
        );
      } catch {
        toast.error("Failed to update Request status. Please try again.");
      }
    },
    []
  );

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
            <TableHead className="text-center align-middle px-4 py-2 ">
              Requester
            </TableHead>
            <TableHead className="text-center align-middle px-4 py-2 ">
              Title
            </TableHead>
            <TableHead className="text-center align-middle px-4 py-2 ">
              Request Time
            </TableHead>
            <TableHead className="text-center align-middle px-4 py-2 ">
              Meal
            </TableHead>
            <TableHead className="text-center align-middle px-4 py-2 ">
              Status
            </TableHead>
            <TableHead className="text-center align-middle px-4 py-2 ">
              Closed Time
            </TableHead>
            <TableHead className="text-center align-middle px-4 py-2 ">
              Requests
            </TableHead>
            <TableHead className="text-center align-middle px-4 py-2 ">
              Accepted
            </TableHead>
            <TableHead className="text-center align-middle px-4 py-2 ">
              Notes
            </TableHead>
            <TableHead className="text-center align-middle px-4 py-2 ">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="text-center align-middle px-4 py-2 ">
                  {record.requester ?? "-"}
                </TableCell>
                <TableCell className="text-center align-middle px-4 py-2 ">
                  {record.requester_title ?? "-"}
                </TableCell>
                <TableCell className="text-center align-middle px-4 py-2 ">
                  {record.request_time?.replace("T", " ") ?? "-"}
                </TableCell>
                <TableCell className="text-center align-middle px-4 py-2 ">
                  {record.meal ?? "-"}
                </TableCell>
                <TableCell className="text-center align-middle px-4 py-2 ">
                  {record.status_name ?? "-"}
                </TableCell>
                <TableCell className="text-center align-middle px-4 py-2 ">
                  {record.closed_time?.replace("T", " ") ?? "-"}
                </TableCell>
                <TableCell className="text-center align-middle px-4 py-2 ">
                  {record.total_lines ?? "-"}
                </TableCell>
                <TableCell className="text-center align-middle px-4 py-2 ">
                  {record.accepted_lines ?? "-"}
                </TableCell>
                <TableCell className="text-center align-middle px-4 py-2 ">
                  {record.notes ?? "-"}
                </TableCell>
                <TableCell className="text-center align-middle px-4 py-2 ">
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
