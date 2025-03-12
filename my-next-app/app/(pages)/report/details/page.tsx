import { Suspense } from "react";
import TableSkelton from "@/components/Table/table-skelton";
import { Column, TableBody } from "@/components/Table/table-body";
import TableSearch from "@/components/Table/table-search";
import { TablePagination } from "@/components/Table/table-pagination";
import { URLSwitch } from "./URLSwitch";
import DateRangePicker from "@/components/Table/date-range-picker";
import { fetchReportDetails } from "@/lib/services/report-details";
import { Download as DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tableDownload } from "@/components/Table/table-download";

interface ReportDetailsRecord {
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

interface ReportDetailsResponse {
  total_pages: number;
  request_lines: ReportDetailsRecord[];
}

interface PageProps {
  searchParams: {
    query?: string;
    page?: string;
    startDate?: string;
    endDate?: string;
    updateAttendance?: boolean | string;
  };
}

export default async function Page({ searchParams }: PageProps) {
  // Construct a key from search parameters to force a remount on each refetch.
  const query = searchParams?.query || "";
  const page = Number(searchParams?.page) || 1;
  const startDate = searchParams?.startDate || "";
  const endDate = searchParams?.endDate || "";
  const updateAttendance =
    searchParams?.updateAttendance === "true" ||
    searchParams?.updateAttendance === true;

async function Export() {
  console.log("Inside download")
  const download = true
  const response: ReportDetailsResponse | null = await fetchReportDetails(
    query,
    page,
    startDate,
    endDate,
    download
  );
  await tableDownload({ response.request_lines })
}

  const response: ReportDetailsResponse | null = await fetchReportDetails(
    query,
    page,
    startDate,
    endDate,
    updateAttendance
  );

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
    { header: "Notes", accessor: "notes" },
  ];

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
          <URLSwitch placeholder="Update Attendance" />
          <Button variant="outline" onClick={() => Export()}
          >
      <DownloadIcon className="mr-2 h-4 w-4" />
      Download
    </Button>
        </div>
      </div>

      <Suspense fallback={<TableSkelton />}>
        <TableBody<ReportDetailsRecord>
          columns={columns}
          data={response?.request_lines || []}
          className="shadow-sm"
        />
        <div className="mt-5 flex w-full justify-center">
          <TablePagination
            currentPage={page}
            totalPages={response?.total_pages || 1}
          />
        </div>
      </Suspense>
    </div>
  );
}
