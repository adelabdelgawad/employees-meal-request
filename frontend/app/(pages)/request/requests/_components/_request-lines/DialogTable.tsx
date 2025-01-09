import React from "react";
import DataRow from "./DataRow";

interface DialogTableProps {
  data: any[];
  originalData: any[];
  disableStatus: boolean;
  onSwitchChange: (lineId: number, checked: boolean) => void;
}

const DialogTable: React.FC<DialogTableProps> = ({
  data,
  originalData,
  disableStatus,
  onSwitchChange,
}) => {
  return (
    <table className="w-full border-collapse border border-gray-300">
      <thead>
        <tr className="border border-gray-300 px-2 py-1 text-center">
          <th>Employee</th>
          <th>Attendance</th>
          <th>Shift</th>
          <th>Accepted</th>
        </tr>
      </thead>
      <tbody>
        {data.map((line) => (
          <DataRow
            key={line.id}
            line={line}
            originalData={originalData}
            disableStatus={disableStatus}
            onSwitchChange={onSwitchChange}
          />
        ))}
      </tbody>
    </table>
  );
};

export default DialogTable;
