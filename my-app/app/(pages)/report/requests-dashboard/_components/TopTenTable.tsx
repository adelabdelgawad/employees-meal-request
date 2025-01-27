"use client";

import { useRouter } from "next/navigation";

// Define Props Type
interface DepartmentTableProps {
  data: {
    department: string;
    dinnerRequests: number;
    lunchRequests: number;
  }[];
}

const TopTenTable: React.FC<DepartmentTableProps> = ({ data }) => {
  const router = useRouter();

  // Sort by Dinner Requests
  const sortedDinner = [...data]
    .sort((a, b) => b.dinnerRequests - a.dinnerRequests)
    .slice(0, 10);
  // Sort by Lunch Requests
  const sortedLunch = [...data]
    .sort((a, b) => b.lunchRequests - a.lunchRequests)
    .slice(0, 10);

  const handleRowClick = (department: string) => {
    router.push(`/dashboard/${department.toLowerCase()}`);
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="border rounded-lg bg-white shadow overflow-y-auto">
        <h4 className="p-4 font-bold">Top 10 Dinner Requests</h4>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="border-b p-2">Department</th>
              <th className="border-b p-2">Dinner Requests</th>
            </tr>
          </thead>
          <tbody>
            {sortedDinner.map((request, index) => (
              <tr
                key={index}
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => handleRowClick(request.department)}
              >
                <td className="border-b p-2">{request.department}</td>
                <td className="border-b p-2">{request.dinnerRequests}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="border rounded-lg bg-white shadow overflow-y-auto">
        <h4 className="p-4 font-bold">Top 10 Lunch Requests</h4>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="border-b p-2">Department</th>
              <th className="border-b p-2">Lunch Requests</th>
            </tr>
          </thead>
          <tbody>
            {sortedLunch.map((request, index) => (
              <tr
                key={index}
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => handleRowClick(request.department)}
              >
                <td className="border-b p-2">{request.department}</td>
                <td className="border-b p-2">{request.lunchRequests}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopTenTable;
