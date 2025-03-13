// page.tsx
import { Suspense } from "react";
import TableSkelton from "@/components/Table/table-skelton";
import TableSearch from "@/components/Table/table-search";
import DateRangePicker from "@/components/Table/date-range-picker";
import { getRequests } from "@/lib/services/request-requests";
import Counter from "./Counter";
import TableWithSWR from "./TableWithSWR";

interface PageProps {
  searchParams: {
    query?: string;
    page?: string;
    startDate?: string;
    endDate?: string;
  };
}

export default async function Page({ searchParams }: PageProps) {
  // Extract query parameters
  const query = searchParams?.query || "";
  const page = Number(searchParams?.page) || 1;
  const startDate = searchParams?.startDate || "";
  const endDate = searchParams?.endDate || "";

  // Fetch initial data on the server.
  const response: RequestsResponse | null = await getRequests(
    query,
    page,
    startDate,
    endDate
  );

  return (
    <div className="w-full p-0">
      <div className="flex w-full items-center justify-between"></div>
      <div className="flex items-center justify-between mb-5">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <TableSearch placeholder="Search Employee Name..." />
          <DateRangePicker />
        </div>
        {/* Right Section */}
        <div className="flex items-center gap-4">
          <Counter />
        </div>
      </div>

      <Suspense fallback={<TableSkelton />}>
        <TableWithSWR fallbackData={response} query={query} currentPage={page} />
      </Suspense>
    </div>
  );
}
