import { Suspense } from "react";
import Skelton from "./table-skelton";
import { DatePickerWithRange } from "./date-range-picker";
import { Column, DataTable } from "./table-body";
import { Download } from "./table-download";
import { Options } from "./table-options";
import { fetchReportDetails } from "@/lib/services/report-details";
import Search from "./table-search";
import { ServerPagination } from "./table-pagination";


interface PageProps {
  searchParams: {
    query?: string;
    page?: string;
    startTime?: string;
    endTime?: string;

  };
}

/**
 * The main page component which renders a server-side paginated table.
 *
 * @param {PageProps} props - Contains the search parameters.
 * @returns {JSX.Element} The rendered page.
 */
export default async function Page({ searchParams }: PageProps) {
  const query = searchParams?.query || "";
  const currentPage = Number(searchParams?.page) || 1;
  const startTime = searchParams?.startTime || "";
  const endTime = searchParams?.endTime || "";
  const pageSize = 10;

  let response = null;
  
  try {
    response = await fetchReportDetails({
      query,
      currentPage,
      pageSize,
      startTime,
      endTime
    });
  } catch (error) {
    console.error("Error fetching report details:", error);
  }

  const totalPages = response?.total_pages || 1;
  const data: ReportDetailsRecord[] = response?.request_lines || []

  const columns: Column<ReportDetailsRecord>[] = [
    { header: "Code", accessor: "id" },
    { header: "Employee Code", accessor: "employee_code" },
    { header: "Employee Name", accessor: "employee_name" },
    { header: "Employee Title", accessor: "employee_title" },
    { header: "Department", accessor: "department" },
    { header: "Requester", accessor: "requester_name" },
    { header: "Requester Title", accessor: "requester_title" },
    { header: "Request Time", accessor: "request_time" },
    { header: "Meal", accessor: "meal" },
    { header: "Attendance In", accessor: "attendance_in" },
    { header: "Attendance Out", accessor: "attendance_out" },
    { header: "Notes", accessor: "notes" }
  ];

  return (
    <div className="w-full p-4">
      <div className="flex w-full items-center justify-between">
        <h1 className="text-2xl">ReportDetailsRecords</h1>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search ReportDetailsRecords..." />
        <DatePickerWithRange />
        <Download data={data} />
      </div>
      <Suspense fallback={<Skelton />}>
        <DataTable<ReportDetailsRecord>
          columns={columns}
          data={data}
          options={(id: number) => <Options id={id} />}
          className="shadow-sm"
        />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <ServerPagination currentPage={currentPage} totalPages={totalPages} />
      </div>
    </div>
  );
}
