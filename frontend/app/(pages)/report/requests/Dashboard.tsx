import { DashboardRecord } from "@/pages/definitions";
import React, { Suspense } from "react";
import StatCard from "./_components/StatCard";
import DepartmentChart from "./_components/DepartmentChart";
import DepartmentTable from "./_components/DepartmentTable";

export default function Dashboard(records: DashboardRecord[]) {
  // Calculate totals
  const totalDinnerRequests = records.reduce(
    (sum, d) => sum + d.dinnerRequests,
    0
  );
  const totalLunchRequests = records.reduce(
    (sum, d) => sum + d.lunchRequests,
    0
  );
  const totalRequests = totalDinnerRequests + totalLunchRequests;

  return (
    <div className="flex flex-col p-2 gap-5 bg-gray-300 min-h-screen">
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
            <DepartmentChart data={records} />
          </Suspense>
        </div>

        {/* Table Section */}
        <div className="flex-1 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold mb-4">
            Top 10 Requester Departments
          </h3>
          <Suspense fallback={<div>Loading Table...</div>}>
            <DepartmentTable data={records} />
          </Suspense>
        </div>
      </div>

      {/* <div className="flex-1 bg-white p-6 rounded-lg shadow">
        <DashboardTable data={records} />
      </div> */}
    </div>
  );
}
