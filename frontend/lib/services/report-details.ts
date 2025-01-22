export async function fetchReportDetails({
  query = '',
  currentPage = 1,
  pageSize = 20,
  startTime = '',
  endTime = '',
  download = false,
} = {}) {
  try {
    const baseUrl = 'http://localhost:8000/report-details';
    const url = new URL(baseUrl);

    // Add query parameters
    url.searchParams.append('query', query);
    url.searchParams.append('page', currentPage.toString());
    url.searchParams.append('page_size', pageSize.toString());
    url.searchParams.append('start_time', startTime);
    url.searchParams.append('end_time', endTime);

    if (download) {
      url.searchParams.append('download', 'true');
    }

    const response = await fetch(url.toString(), { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching report details:', error);
    throw error;
  }
}
