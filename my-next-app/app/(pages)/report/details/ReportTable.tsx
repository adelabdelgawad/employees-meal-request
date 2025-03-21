"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Column, TableBody } from "@/components/Table/table-body";
import dayjs from "dayjs";
import { fetchReportDetails } from "@/lib/actions/report-details";
import TableSkelton from "@/components/Table/table-skelton";
import { TablePagination } from "@/components/Table/table-pagination";

export interface ReportDetailsRecord {
  id: string;
  employee_code: string;
  employee_name: string;
  employee_title: string;
  department: string;
  requester_name: string;
  requester_title: string;
  request_time: string;
  meal: string;
  attendance_in: string;
  attendance_out: string;
  notes: string;
}

export interface ReportDetailsResponse {
  total_pages: number;
  request_lines: ReportDetailsRecord[];
}

export default function ReportTable() {
  const searchParams = useSearchParams();

  // Extract query parameters
  const query = searchParams?.get("query") || "";
  const page = Number(searchParams?.get("page")) || 1;
  const startDate = searchParams?.get("startDate") || "";
  const endDate = searchParams?.get("endDate") || "";
  const updateAttendance = searchParams?.get("updateAttendance") === "true";

  const [data, setData] = useState<ReportDetailsResponse | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const response = await fetchReportDetails(
          query,
          page,
          startDate,
          endDate,
          updateAttendance
        );
        setData(response);
        setError(null);
      } catch (err: unknown) {
        // Ensure the caught error is of type Error
        if (err instanceof Error) {
          setError(err);
        } else {
          setError(new Error("An unexpected error occurred"));
        }
        setData(null);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [query, page, startDate, endDate, updateAttendance]);
  // Define table columns
  const columns: Column<ReportDetailsRecord>[] = [
    { header: "ID", accessor: "id" },
    { header: "Employee Code", accessor: "employee_code" },
    { header: "Employee Name", accessor: "employee_name" },
    { header: "Employee Title", accessor: "employee_title" },
    { header: "Department", accessor: "department" },
    { header: "Requester", accessor: "requester_name" },
    { header: "Requester Title", accessor: "requester_title" },
    {
      header: "Request Time",
      accessor: (row) => row.request_time.replace("T", " "),
    },
    { header: "Meal", accessor: "meal" },
    {
      header: "Attendance In",
      accessor: (row) =>
        row.attendance_in
          ? dayjs(row.attendance_in).format("YYYY-MM-DD HH:mm:ss")
          : "N/A",
    },
    {
      header: "Attendance Out",
      accessor: (row) =>
        row.attendance_out
          ? dayjs(row.attendance_out).format("YYYY-MM-DD HH:mm:ss")
          : "N/A",
    },
    { header: "Notes", accessor: "notes" },
  ];

  if (error) return <div>Error loading data</div>;

  // Show the skeleton while loading.
  if (loading) return <TableSkelton />;

  return (
    <>
      {/* Wrap the table in a scrollable container */}
<div className="overflow-x-auto">
  <TableBody<ReportDetailsRecord>
    columns={columns}
    data={data?.request_lines || []}
    className="shadow-sm min-w-[800px]"
  />
</div>
      <div className="mt-5 flex w-full justify-center">
        <TablePagination currentPage={page} totalPages={data?.total_pages || 1} />
      </div>
    </>
  );
}
