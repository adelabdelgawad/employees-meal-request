export async function getRequests(fromDate?: string, toDate?: string) {
  try {
    const formatDate = (date: Date) => {
      console.log('date', date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is zero-based
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const fromDateFormatted = fromDate ? formatDate(new Date(fromDate)) : '';
    const toDateFormatted = toDate ? formatDate(new Date(toDate)) : '';

    const response = await fetch(
      `http://localhost:8000/requests?from_date=${fromDateFormatted}&to_date=${toDateFormatted}`,
      {
        cache: 'no-store',
      },
    );

    if (!response.ok) {
      throw new Error('Failed to fetch requests');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching requests:', error);
    return [];
  }
}
