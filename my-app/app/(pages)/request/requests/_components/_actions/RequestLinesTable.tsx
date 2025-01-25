import React from "react";
import { format } from "date-fns";
import { Rubik } from "next/font/google";
import { Switch } from "@/components/ui/switch"; // Adjust the path based on your setup

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
        <table className="min-w-full border-collapse text-sm text-left">
          <thead>
            <tr>
              <th className="px-4 py-2">Employee</th>
              <th className="px-4 py-2">Attendance</th>
              <th className="px-4 py-2">Shift Hours</th>
              <th className="px-4 py-2">Accepted</th>
            </tr>
          </thead>
        </table>
      </div>

      {/* Table Body (Scrollable) */}
      <div className="flex-grow overflow-y-auto h-[calc(100vh-12rem)]">
        <table className="min-w-full border-collapse text-sm text-left">
          <tbody>
            {data.map((line) => (
              <tr
                key={line.id}
                className={`border-b border-gray-300 hover:bg-gray-50 ${
                  !line.is_accepted
                    ? "bg-red-100"
                    : !line.attendance
                    ? "bg-yellow-100"
                    : ""
                }`}
              >
                {/* Employee Info */}
                <td className="px-4 py-2">
                  <div className="text-left">
                    <div className={`text-sm font-semibold ${rubik.className}`}>
                      {line.name}
                    </div>
                    <div className="text-xs text-gray-500">{line.title}</div>
                    <span className="text-xs text-gray-500 font-bold">
                      Code: {line.code}
                    </span>
                  </div>
                </td>

                {/* Attendance */}
                <td className="px-4 py-2 text-center">
                  {line.attendance
                    ? format(new Date(line.attendance), "yyyy-MM-dd HH:mm:ss")
                    : "N/A"}
                </td>

                {/* Shift */}
                <td className="px-4 py-2 text-center">
                  {line.shift_hours ? line.shift_hours : "N/A"}
                </td>

                {/* Accepted Switch */}
                <td className="px-4 py-2 text-center">
                  <Switch
                    checked={line.is_accepted}
                    onCheckedChange={(checked) =>
                      onSwitchChange(line.id, checked)
                    }
                    disabled={disableStatus}
                    className="focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Buttons */}
      <div className="bg-gray-100 border-t border-gray-300 p-4 flex justify-end space-x-4">
        <button
          onClick={onSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          disabled={disableStatus}
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default RequestLinesTable;
