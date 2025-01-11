import React from "react";
import StatSection from "./_sections/StatSection";
import ChartSection from "./_sections/ChartSection";
import TableSection from "./_sections/TableSection";
import { DashboardRecord } from "@/pages/definitions";
import DetailsTable from "./_sections/DetailsTable";
import { fetchDashboardRecords } from "@/lib/services/requests-dashboard";

const Page = async (): Promise<JSX.Element> => {
  // Fetch dashboard data
  const dashboardData: DashboardRecord[] = await fetchDashboardRecords();

  // Calculate totals
  const totalDinnerRequests = dashboardData.reduce(
    (sum, d) => sum + d.dinnerRequests,
    0
  );
  const totalLunchRequests = dashboardData.reduce(
    (sum, d) => sum + d.lunchRequests,
    0
  );
  const totalRequests = totalDinnerRequests + totalLunchRequests;

  return (
    <div className="min-h-screen bg-gray-100 p-2">
      {/* Header */}
      {/* Stats Section */}
      <div className="mb-2">
        <StatSection
          totalRequests={totalRequests}
          totalDinnerRequests={totalDinnerRequests}
          totalLunchRequests={totalLunchRequests}
        />
      </div>

      {/* Main Content */}
      <div className="flex gap-2">
        <ChartSection records={dashboardData} />
        <TableSection records={dashboardData} />
      </div>

      {/* DetailsTable */}
      <div className="mt-2">
        <DetailsTable records={dashboardData} />
      </div>
    </div>
  );
};

export default Page;
