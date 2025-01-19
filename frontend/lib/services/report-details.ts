interface fetchReportDetailsParams {
  query?: string;
  page?: number;
  pageSize?: number;
}
export async function fetchReportDetails(
  query: string,
  currentPage: number,
  pageSize: number,
) {
  try {
    const res = await fetch(
      `http://localhost:8000/report-details?query=${query}&page=${currentPage}&page_size=${pageSize}`,
      { cache: 'no-store' },
    );

    if (!res.ok) {
      throw new Error('Failed to fetch data');
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}
