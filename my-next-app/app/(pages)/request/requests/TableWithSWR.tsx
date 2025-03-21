// TableWithSWR.tsx
"use client";

import useSWR from "swr";
import { TableBody, Column } from "@/components/Table/table-body";
import Actions from "./_actions/Actions";
import { TablePagination } from "@/components/Table/table-pagination";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface TableWithSWRProps {
  fallbackData: RequestsResponse;
  query: string;
  currentPage: number;
}

export default function TableWithSWR({
  fallbackData,
  query,
  currentPage,
}: TableWithSWRProps) {
  // Using SWR to fetch data, with fallbackData coming from the server.
  const { data, error, mutate } = useSWR(
    `/api/requests?query=${query}&page=${currentPage}`,
    fetcher,
    { fallbackData }
  );

  // Define your table columns
  const columns: Column<RequestRecord>[] = [
    { header: "Code", accessor: "id" },
    { header: "Status", accessor: "status_name" },
    { header: "Requester", accessor: "requester" },
    { header: "Requester Title", accessor: "requester_title" },
    { header: "Meal", accessor: "meal" },
    {
      header: "Request Time",
      accessor: (row) => row.request_time.replace("T", " "),
    },
    {
      header: "Closed Time",
      accessor: (row) => row.closed_time?.replace("T", " "),
    },
    { header: "Notes", accessor: "notes" },
    { header: "Total Lines", accessor: "total_lines" },
    { header: "Accepted Lines", accessor: "accepted_lines" },
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