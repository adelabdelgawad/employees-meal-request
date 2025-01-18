export async function fetchReportDetails(
  page: number = 1,
  pageSize: number = 10,
) {
  try {
    const res = await fetch(
      `http://localhost:8000/report-details?page=${page}&pageSize=${pageSize}`,
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
