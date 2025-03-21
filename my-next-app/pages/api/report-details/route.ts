// app/api/report-details/route.ts
import { fetchReportDetails } from "@/lib/actions/report-details";

export async function GET(request: Request) {
  // Parse URL search parameters if needed
  const url = new URL(request.url);
  const query = url.searchParams.get("query") || "";
  const page = Number(url.searchParams.get("page")) || 1;
  const startDate = url.searchParams.get("startDate") || "";
  const endDate = url.searchParams.get("endDate") || "";
  const updateAttendance = url.searchParams.get("updateAttendance") === "true";

  const response: ReportDetailsResponse | null = await fetchReportDetails(
    query,
    page,
    startDate,
    endDate,
    updateAttendance
  );
 
  console.log(response)
  return response;
}
