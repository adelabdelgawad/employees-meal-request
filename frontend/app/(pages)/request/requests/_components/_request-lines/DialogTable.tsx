import { Rubik } from "next/font/google";
import SwitchButton from "./SwitchButton";

// Apply Rubik font
const rubik = Rubik({ subsets: ["latin"], weight: ["400", "500", "700"] });

interface DialogTableProps {
  data: {
    id: number;
    name: string;
    title: string;
    code: string;
    attendance: string;
    shift_id: string;
    is_accepted: boolean;
  }[];
  disableStatus: boolean;
  onSwitchChange: (lineId: number, checked: boolean) => void;
}

const DialogTable: React.FC<DialogTableProps> = ({ data, disableStatus, onSwitchChange }) => {
  return (
    <table className="min-w-full border-collapse text-sm text-left">
      <thead>
        <tr className="bg-gray-100 border-b border-gray-300">
          <th className="px-4 py-2">Employee</th>
          <th className="px-4 py-2">Attendance</th>
          <th className="px-4 py-2">Shift</th>
          <th className="px-4 py-2">Accepted</th>
        </tr>
      </thead>
      <tbody>
        {data.map((line) => (
          <tr key={line.id} className="border-b border-gray-300 hover:bg-gray-50">
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
            <td className="px-4 py-2">{line.attendance}</td>

            {/* Shift */}
            <td className="px-4 py-2">{line.shift_id}</td>

            {/* Accepted Switch */}
            <td className="px-4 py-2 text-center">
              <SwitchButton
                checked={line.is_accepted}
                lineId={line.id}
                disableStatus={disableStatus}
                onSwitchChange={onSwitchChange}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DialogTable;
