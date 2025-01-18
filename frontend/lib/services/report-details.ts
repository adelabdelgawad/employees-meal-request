interface FetchReportDetailsParams {
  query?: string;
  page?: number;
  pageSize?: number;
}

export async function fetchReportDetails({
  query = '',
  page = 1,
  pageSize = 10,
}: FetchReportDetailsParams) {
  try {
    const res = await fetch(
      `http://localhost:8000/report-details?query=${encodeURIComponent(
        query,
      )}&page=${page}&pageSize=${pageSize}`,
      {
        cache: 'no-store', // Ensures fresh data each time
      },
    );

    if (!res.ok) {
      throw new Error('Failed to fetch report details');
    }

    const data = await res.json();

    // Convert snake_case to camelCase if needed
    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch report details.');
  }
}
