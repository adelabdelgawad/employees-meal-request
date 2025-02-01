import React, { Suspense } from "react";
import DataTable from "./_components/DataTable";
import DataTableHeader from "./_components/DataTableHeader";
import { fetchReportDetails } from "@/lib/services/report-details";
import { DataTableFooter } from "./_components/DataTableFooter";

interface SearchParams {
  query?: string;
  page?: string;
  page_size?: string;
  start_time?: string;
  end_time?: string;
  update_attendance?: boolean;
}

export default async function Page({
  searchParams: searchParamsPromise,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  // Await searchParams fully before accessing its properties
  const searchParams = (await searchParamsPromise) || {};

  // 1. Parse search parameters
  const {
    query = "",
    page = "1",
    page_size = "20",
    start_time = "",
    end_time = "",
    update_attendance = false,
  } = searchParams;

  // 2. Fetch data (server-side)
  const currentPage = parseInt(page, 10);
  const pageSize = parseInt(page_size, 10);
  let data = null;

  try {
    data = await fetchReportDetails({
      query,
      currentPage,
      pageSize,
      startTime: start_time,
      endTime: end_time,
      update_attendance,
    });
  } catch (error) {
    console.error("Error fetching report details:", error);
  }

  // 3. Use totalPages from fetched data if available
  const totalPages = data?.total_pages || 1;

  return (
    <div className="flex flex-col m-2">
      {/* Header */}
      <div>
        <DataTableHeader />
      </div>

      {/* Table */}
      <div>
        <Suspense key={`${query}-${currentPage}-${pageSize}`}>
          {data ? <DataTable data={data.data} /> : <div>No data available</div>}
        </Suspense>
      </div>

      {/* Footer */}
      <div className="mt-2">
        <DataTableFooter
          pageSize={pageSize}
          currentPage={currentPage}
          totalPages={totalPages}
          rowsPerPage={pageSize}
          totalRows={data?.total_rows || 0}
        />
      </div>
    </div>
  );
}
