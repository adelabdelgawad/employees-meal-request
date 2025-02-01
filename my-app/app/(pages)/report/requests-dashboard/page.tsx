"use client";

import StatSection from "./_sections/StatSection";
import ChartSection from "./_sections/ChartSection";
import TopTenSection from "./_sections/TopTenSection";
import { useReportRequest } from "@/hooks/ReportRequestContext";

export default function page() {
  // Fetch dashboard data
  const { filteredRequests: requests } = useReportRequest();

  // Calculate totals
  const totalDinnerRequests = requests.reduce(
    (sum, d) => sum + d.dinnerRequests,
    0
  );
  const totalLunchRequests = requests.reduce(
    (sum, d) => sum + d.lunchRequests,
    0
  );
  const totalRequests = totalDinnerRequests + totalLunchRequests;

  return (
    <div className=" bg-gray-100 p-2">
      {/* Header */}
      <div className="p-2"></div>
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
        <ChartSection records={requests} />
        <TopTenSection records={requests} />
      </div>
    </div>
  );
}
