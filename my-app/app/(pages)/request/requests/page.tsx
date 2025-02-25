// app/page.tsx
import React from "react";
import DataTableHeader from "./_components/DataTableHeader";
import { DataTableFooter } from "./_components/DataTableFooter";
import DataTable from "./_components/DataTable";
import { getRequests } from "@/lib/services/request-requests";
import { getSession } from "@/lib/session";

interface SearchParams {
  query?: string;
  page?: string;
  page_size?: string;
  start_time?: string;
  end_time?: string;
}

export default async function Page({
  searchParams = Promise.resolve({}),
}: {
  searchParams?: Promise<SearchParams>; // Mark searchParams as a Promise
}) {
  // Await the searchParams before accessing its properties
  const resolvedSearchParams = await searchParams;

  // 1. Parse search parameters
  const query = resolvedSearchParams.query || ""; // Default to an empty search query
  const currentPage = Number(resolvedSearchParams.page) || 1; // Default to page 1
  const pageSize = Number(resolvedSearchParams.page_size) || 20; // Default rows per page
  const startTime = resolvedSearchParams.start_time || "";
  const endTime = resolvedSearchParams.end_time || "";
  const session = await getSession();
  const userRoles: string[] = session?.user?.roles || [];
  const userId: number = session?.user?.userId || 0;
  const isAdmin = userRoles.includes("Admin");
  


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
        <DataTableHeader/>
      </div>

      {/* Table */}
      <div>
        {error ? (
          <div className="error-message">
            Failed to load data. Please try again later.
          </div>
        ) : data ? (
          <DataTable initialData={data.data} isAdmin={isAdmin} userId={userId} />
        ) : (
          <div>No data available</div>
        )}
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
