"use client";

import useSWR from "swr";
import { TableBody, Column } from "@/components/Table/table-body";
import { TablePagination } from "@/components/Table/table-pagination";
import { getHistoryRequests } from "@/lib/actions/request-history";
import Actions from "./Actions";

interface TableWithSWRProps {
  fallbackData: RequestsResponse;
  currentPage: number;
}

export default function TableWithSWR({
  fallbackData,
  currentPage,
}: TableWithSWRProps) {
  // Using SWR with a key array and a fetcher function that calls getHistoryRequests.
  const { data, error, mutate } = useSWR(
    ["getHistoryRequests", currentPage],
    ([, currentPage]) => getHistoryRequests(currentPage),
    { fallbackData }
  );

  const columns: Column<RequestRecord>[] = [
    { header: "ID", accessor: "id" },
    { header: "Status", accessor: "status_name" },
    { header: "Meal", accessor: "meal" },
    {
      header: "Request Time",
      accessor: (row) =>
        row.request_time ? row.request_time.replace("T", " ") : "N/A",
    },
    {
      header: "Closed Time",
      accessor: (row) => row.closed_time?.replace("T", " "),
    },
    { header: "Notes", accessor: "notes" },
    { header: "Total Lines", accessor: "total_lines" },
    { header: "Accept Lines", accessor: "accepted_lines" },
  ];

  if (error) return <div>Error loading data...</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <>
      <TableBody<RequestRecord>
        columns={columns}
        data={data.data || []}
        className="shadow-sm"
        // Pass mutate to the Actions component so buttons can update the cache
        options={(_, record: RequestRecord) => (
          <Actions record={record} mutate={mutate} />
        )}
      />
      <div className="mt-5 flex w-full justify-center">
        <TablePagination
          currentPage={currentPage}
          totalPages={data.total_pages || 1}
        />
      </div>
    </>
  );
}
