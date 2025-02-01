export async function fetchReportRequestRecords(
  fromDate?: string,
  toDate?: string
) {
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is zero-based
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const fromDateFormatted = fromDate ? formatDate(new Date(fromDate)) : "";
  const toDateFormatted = toDate ? formatDate(new Date(toDate)) : "";

  const res = await fetch(
    `http://localhost:8000/dashboard-records?from_date=${fromDateFormatted}&to_date=${toDateFormatted}`,
    {
      cache: "no-store", // Ensures fresh data each time
    }
  );

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
