"use client";
import React, { useCallback, useState } from "react";
import { format } from "date-fns";
import { Rubik } from "next/font/google";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import ConfirmationDialog from "@/components/confirmation-dialog";
import toast from "react-hot-toast";

const rubik = Rubik({ subsets: ["latin"], weight: ["400", "500", "700"] });

interface RequestLine {
  id: number;
  name: string;
  title: string;
  code: string;
  attendance?: string;
  shift_hours?: string;
  notes?: string;
  is_accepted: boolean;
}

interface RequestLinesTableProps {
  data: RequestLine[];
  disableStatus: boolean;
  onCancel: () => void;
  onDelete?: (id: number) => Promise<void>;
}

const TableRowComponent: React.FC<{
  line: RequestLine;
  disableStatus: boolean;
  onDeleteClick: (id: number) => void;
}> = ({ line, disableStatus, onDeleteClick }) => {
  const rowClass = !line.is_accepted
    ? "bg-red-100"
    : !line.attendance_in
    ? "bg-yellow-100"
    : "hover:bg-gray-50";

  return (
    <TableRow className={`${rowClass} text-center`}>
      <TableCell className="text-center align-middle px-4 py-2 min-w-[200px]">
        <div className={`text-sm font-semibold ${rubik.className}`}>
          {line.name}
        </div>
        <div className="text-xs text-gray-500">{line.title}</div>
        <span className="text-xs text-gray-500 font-bold">
          Code: {line.code}
        </span>
      </TableCell>

      <TableCell className="text-center align-middle px-4 py-2 min-w-[120px]">
        {line.attendance_in
          ? format(new Date(line.attendance_in), "yyyy-MM-dd HH:mm")
          : "N/A"}
      </TableCell>

      <TableCell className="items-center text-center align-middle px-4 py-2 min-w-[80px]">
        {line.shift_hours || "N/A"}
      </TableCell>

      <TableCell className="text-center align-middle px-4 py-2 min-w-[200px]">
        {line.notes || "N/A"}
      </TableCell>

      <TableCell className="px-4 py-2 min-w-[80px] text-center">
        <div className="flex items-center justify-center">
          <button
            onClick={() => onDeleteClick(line.id)}
            className={`w-10 h-10 flex items-center justify-center rounded-full ${
              disableStatus
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-red-500 text-white cursor-pointer hover:bg-red-600"
            }`}
            disabled={disableStatus}
            aria-label={`Delete entry for ${line.name}`}
          >
            <Trash size={20} />
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
};

const RequestLinesTable: React.FC<RequestLinesTableProps> = ({
  data,
  disableStatus,
  onCancel,
  onDelete,
}) => {
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const handleDeleteInitiated = useCallback((id: number) => {
    setPendingDeleteId(id);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!pendingDeleteId || !onDelete) return;
    try {
      await onDelete(pendingDeleteId);
      toast.success("Request line deleted successfully");
    } catch (error) {
      toast.error("Failed to delete entry. Please try again.");
    } finally {
      setPendingDeleteId(null);
    }
  }, [pendingDeleteId, onDelete]);

  return (
    <div className="flex flex-col h-full border border-gray-300 rounded-lg shadow">
      {/* Make the table itself scrollable */}
      <div className="flex-grow overflow-auto relative">
        <Table className="w-full min-w-[1000px]">
          {/* Sticky Header */}
          <TableHeader className="sticky top-0 bg-gray-100 z-10">
            <TableRow className="text-center">
              <TableHead className="text-center align-middle px-4 py-2 min-w-[200px]">
                Employee
              </TableHead>
              <TableHead className="text-center align-middle px-4 py-2 min-w-[120px]">
                Attendance
              </TableHead>
              <TableHead className="text-center align-middle px-4 py-2 min-w-[80px]">
                Shift Hours
              </TableHead>
              <TableHead className="text-center align-middle px-4 py-2 min-w-[200px]">
                Notes
              </TableHead>
              <TableHead className="text-center align-middle px-4 py-2 min-w-[80px]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data.map((line) => (
              <TableRowComponent
                key={line.id}
                line={line}
                disableStatus={disableStatus}
                onDeleteClick={handleDeleteInitiated}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer with Close button */}
      <div className="bg-gray-100 border-t border-gray-300 p-4 flex justify-end space-x-4">
        <Button
          onClick={onCancel}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          Close
        </Button>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={pendingDeleteId !== null}
        title="Confirm Deletion"
        message={`Are you sure you want to delete the entry for ${
          data.find((l) => l.id === pendingDeleteId)?.name || "this item"
        }?`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />
    </div>
  );
};

export default RequestLinesTable;
