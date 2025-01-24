import React, { Suspense } from "react";
import DataTableHeader from "./_components/DataTableHeader";
import { DataTableFooter } from "./_components/DataTableFooter";
import DataTable from "./_components/DataTable";
import { getRequests } from "@/lib/services/request-requests";

interface SearchParams {
  query?: string;
  page?: string;
  page_size?: string;
  start_time?: string;
  end_time?: string;
}

export default async function Page({
  searchParams: searchParamsPromise,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  // Await searchParams fully before accessing its properties
  const searchParams = (await Promise.resolve(searchParamsPromise)) || {};

  // 1. Parse search parameters
  const query = searchParams.query || ""; // Default to an empty search query
  const currentPage = Number(searchParams.page) || 1; // Default to page 1
  const pageSize = Number(searchParams.page_size) || 20; // Default rows per page
  const startTime = searchParams.start_time || "";
  const endTime = searchParams.end_time || "";

  // 2. Fetch data (server-side)
  let data = null;
  let error = null;

  try {
    data = await getRequests({
      query,
      currentPage,
      pageSize,
      startTime,
      endTime,
    });
    console.log(data);
  } catch (err) {
    console.error("Error fetching report details:", err);
    error = err;
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
          {error ? (
            <div className="error-message">
              Failed to load data. Please try again later.
            </div>
          ) : data ? (
            <DataTable data={data.data} />
          ) : (
            <div>No data available</div>
          )}
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
