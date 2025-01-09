import { Suspense } from "react";
import DepartmentChart from "./_components/DepartmentChart";
import DepartmentTable from "./_components/DepartmentTable";
import StatCard from "./_components/StatCard";

// Define Request Type
type RequestData = {
  department: string;
  dinnerRequests: number;
  lunchRequests: number;
};

// Fetch Requests Data
const fetchRequests = async (): Promise<RequestData[]> => {
  return [
    { department: "HR", dinnerRequests: 20, lunchRequests: 25 },
    { department: "Finance", dinnerRequests: 30, lunchRequests: 18 },
    { department: "Engineering", dinnerRequests: 40, lunchRequests: 35 },
    { department: "Marketing", dinnerRequests: 15, lunchRequests: 22 },
    { department: "Sales", dinnerRequests: 50, lunchRequests: 45 },
  ];
};

const Dashboard = async () => {
  const requestData = await fetchRequests();

  // Calculate totals
  const totalDinnerRequests = requestData.reduce((sum, d) => sum + d.dinnerRequests, 0);
  const totalLunchRequests = requestData.reduce((sum, d) => sum + d.lunchRequests, 0);
  const totalRequests = totalDinnerRequests + totalLunchRequests;

  return (
    <div className="flex flex-col p-2 gap-5 bg-gray-100 min-h-screen">
      {/* Stats Section */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Total Requests" value={totalRequests} />
        <StatCard title="Total Dinner Requests" value={totalDinnerRequests} />
        <StatCard title="Total Lunch Requests" value={totalLunchRequests} />
      </div>

      <div className="flex">
        {/* Chart Section */}
        <div className="w-1/3 bg-white p-6 rounded-lg shadow mr-6">
          <h3 className="text-lg font-bold mb-4">Requests by Department</h3>
          <Suspense fallback={<div>Loading Chart...</div>}>
            <DepartmentChart data={requestData} />
          </Suspense>
        </div>

        {/* Table Section */}
        <div className="flex-1 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">Top 10 Requester Departments</h3>
          <Suspense fallback={<div>Loading Table...</div>}>
            <DepartmentTable data={requestData} />
          </Suspense>
        </div>
      </div>

      <div className="flex-1 bg-white p-6 rounded-lg shadow">
      <DepartmentTable data={requestData} />
      </div>
    </div>
  );
};

export default Dashboard;
