import { DashboardRecord } from "@/pages/definitions";

export async function fetchDashboardRecords() {
  const res = await fetch("http://localhost:8000/dashboard-records", {
    cache: "no-store", // Ensures fresh data each time
  });

  if (!res.ok) {
    throw new Error("Failed to fetch dashboard records");
  }

  const data = await res.json();

  // Convert snake_case to camelCase
  return data.map((record: any) => ({
    id: record.id,
    department: record.department,
    dinnerRequests: record.dinner_requests,
    lunchRequests: record.lunch_requests,
  }));
}
