// app/[your-route]/Page.tsx
import { Suspense } from "react";
import dynamic from "next/dynamic";
import TableSearch from "@/components/Table/table-search";
import { URLSwitch } from "./URLSwitch";
import DateRangePicker from "@/components/Table/date-range-picker";
import DownloadButton from "./DownloadButton";

// Dynamically import ReportTable as a client component
const ReportTable = dynamic(() => import("./ReportTable"), { ssr: false });

interface PageProps {
  searchParams: {
    query?: string;
    page?: string;
    startDate?: string;
    endDate?: string;
    updateAttendance?: boolean | string;
  };
}

export default function Page({ searchParams }: PageProps) {
  // Extract query parameters for the DownloadButton
  const query = searchParams?.query || "";
  const page = Number(searchParams?.page) || 1;
  const startDate = searchParams?.startDate || "";
  const endDate = searchParams?.endDate || "";

  return (
    <div className="w-full p-2 overflow-hidden">
      {/* Responsive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-4">
        {/* Left Section */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <TableSearch placeholder="Search Employee Name..." />
          <DateRangePicker additionalParamstoDelete="updateAttendance" />
        </div>
        {/* Right Section */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <URLSwitch placeholder="Update Attendance" />
          <DownloadButton
            query={query}
            page={page}
            startDate={startDate}
            endDate={endDate}
          />
        </div>
      </div>

      <Suspense fallback={null}>
        <ReportTable />
      </Suspense>
    </div>
  );
}