import React from "react";
import { format } from "date-fns";
import { Rubik } from "next/font/google";
import { Switch } from "@/components/ui/switch"; // Adjust the path based on your setup
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Import shadcn table components
import { Button } from "@/components/ui/button";

const rubik = Rubik({ subsets: ["latin"], weight: ["400", "500", "700"] });

interface RequestLinesTableProps {
  data: any[];
  disableStatus: boolean;
  onSwitchChange: (lineId: number, checked: boolean) => void;
  onSave: () => void; // Function for Save button
  onCancel: () => void; // Function for Cancel button
}

const RequestLinesTable: React.FC<RequestLinesTableProps> = ({
  data,
  disableStatus,
  onSwitchChange,
  onSave,
  onCancel,
}) => {
  return (
    <div className="flex flex-col h-full border border-gray-300 rounded-lg shadow">
      {/* Table Header */}
      <div className="bg-gray-100 border-b border-gray-300">
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/4 text-center px-4 py-2">
                Employee
              </TableHead>
              <TableHead className="w-1/4 text-center px-4 py-2">
                Attendance
              </TableHead>
              <TableHead className="w-1/4 text-center px-4 py-2">
                Shift Hours
              </TableHead>
              <TableHead className="w-1/4 text-center px-4 py-2">
                Notes
              </TableHead>
              <TableHead className="w-1/4 text-center px-4 py-2">
                Accepted
              </TableHead>
            </TableRow>
          </TableHeader>
        </Table>
      </div>

      {/* Table Body (Scrollable) */}
      <div className="flex-grow overflow-y-auto h-[calc(100vh-16rem)]">
        <Table className="w-full table-fixed">
          <TableBody>
            {data.map((line) => (
              <TableRow
                key={line.id}
                className={`hover:bg-gray-50 ${
                  !line.is_accepted
                    ? "bg-red-100"
                    : !line.attendance
                    ? "bg-yellow-100"
                    : ""
                }`}
              >
                {/* Employee Info */}
                <TableCell className="text-center px-4 py-2">
                  <div className={`text-sm font-semibold ${rubik.className}`}>
                    {line.name}
                  </div>
                  <div className="text-xs text-gray-500">{line.title}</div>
                  <span className="text-xs text-gray-500 font-bold">
                    Code: {line.code}
                  </span>
                </TableCell>

                {/* Attendance */}
                <TableCell className="text-center px-4 py-2">
                  {line.attendance
                    ? format(new Date(line.attendance), "yyyy-MM-dd HH:mm:ss")
                    : "N/A"}
                </TableCell>

                {/* Shift */}
                <TableCell className="text-center px-4 py-2">
                  {line.shift_hours ? line.shift_hours : "N/A"}
                </TableCell>

                <TableCell className="text-center px-4 py-2">
                  {line.notes ? line.notes : "N/A"}
                </TableCell>

                {/* Accepted Switch */}
                <TableCell className="text-center px-4 py-2">
                  <Switch
                    checked={line.is_accepted}
                    onCheckedChange={(checked) =>
                      onSwitchChange(line.id, checked)
                    }
                    disabled={disableStatus}
                    className="focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Footer Buttons */}

      <div className="bg-gray-100 border-t border-gray-300 p-4 flex justify-end space-x-4">
        <Button
          onClick={onSave}
          // disabled={disableStatus || changedStatus.length === 0}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Save Changes
        </Button>
        <Button
          onClick={onCancel}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default RequestLinesTable;
