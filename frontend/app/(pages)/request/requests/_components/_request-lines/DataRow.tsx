import React from "react";
import SwitchButton from "./SwitchButton";
import { Rubik } from "next/font/google";

// Apply Rubik font
const rubik = Rubik({ subsets: ["latin"], weight: ["400", "500", "700"] });

interface DataRowProps {
  line: {
    id: number;
    name: string;
    title: string;
    code: string;
    attendance: string;
    shift_id: number;
    is_accepted: boolean;
  };
  originalData: any[];
  disableStatus: boolean;
  onSwitchChange: (lineId: number, checked: boolean) => void;
}

const DataRow: React.FC<DataRowProps> = ({
  line,
  disableStatus,
  onSwitchChange,
}) => {
  return (
    <tr className="border border-gray-300 px-2 py-1 text-center">
      <td>
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
      <td>{line.attendance}</td>
      <td>{line.shift_id}</td>
      <td>
        <SwitchButton
          checked={line.is_accepted}
          lineId={line.id}
          disableStatus={disableStatus}
          onSwitchChange={onSwitchChange}
        />
      </td>
    </tr>
  );
};

export default DataRow;
