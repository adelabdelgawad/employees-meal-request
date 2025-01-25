import React from "react";
import DataTableHeader from "./_components/DataTableHeader";
import { DataTableFooter } from "./_components/DataTableFooter";
import DataTable from "./_components/DataTable";
import { getUsers } from "@/lib/services/setting-user";

interface SearchParams {
  query?: string;
  page?: string;
  page_size?: string;
  start_time?: string;
  end_time?: string;
}

export default async function Page({
  searchParams = {},
}: {
  searchParams?: SearchParams;
}) {
  // Parse search parameters
  const query = searchParams.query || "";
  const currentPage = Number(searchParams.page) || 1;
  const pageSize = Number(searchParams.page_size) || 20;

  // Fetch data (server-side)
  let data = null;
  let error = null;

  try {
    data = await getUsers({
      query,
      currentPage,
      pageSize,
    });
  } catch (err) {
    console.error("Error fetching report details:", err);
    error = err;
  }

  // Use totalPages from fetched data if available
  const totalPages = data?.total_pages || 1;

  return (
    <div className="flex flex-col m-2">
      {/* Header */}
      <div>
        <DataTableHeader initialData={data.data} />
      </div>

      {/* Table */}
      <div>
        {error ? (
          <div className="error-message">
            Failed to load data. Please try again later.
          </div>
        ) : data ? (
          <DataTable initialData={data.data} />
        ) : (
          <div>No data available</div>
        )}
      </div>

      {/* Footer */}
      {data && (
        <div className="mt-2">
          <DataTableFooter
            pageSize={pageSize}
            currentPage={currentPage}
            totalPages={totalPages}
            rowsPerPage={pageSize}
            totalRows={data?.total_rows || 0}
          />
        </div>
      )}
    </div>
  );
}
