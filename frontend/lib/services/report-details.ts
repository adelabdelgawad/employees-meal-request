export async function fetchReportDetails(
  query?: string,
  currentPage?: number,
  pageSize?: number,
  download: boolean = false,
) {
  try {
    // Base URL
    const baseUrl = 'http://localhost:8000/report-details';

    // Construct URL with query parameters
    const url = new URL(baseUrl);

    // Add dynamic parameters
    if (query) {
      const queryParams = new URLSearchParams(query);
      for (const [key, value] of queryParams.entries()) {
        url.searchParams.append(key, value);
      }
    }
    if (currentPage) {
      url.searchParams.append('page', currentPage.toString());
    }
    if (pageSize) {
      url.searchParams.append('page_size', pageSize.toString());
    }

    // Add download flag if required
    if (download) {
      url.searchParams.append('download', 'true');
    }

    const res = await fetch(url.toString(), { cache: 'no-store' });

    if (!res.ok) {
      throw new Error('Failed to fetch data');
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}
