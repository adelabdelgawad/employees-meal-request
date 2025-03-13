export const dynamic = "force-dynamic";

import { cookies } from 'next/headers';
import HistoryDataTable from './_components/HistoryDataTable';
import axiosInstance from '@/lib/axiosInstance';

/**
 * Fetches history data from the API.
 *
 * @returns The history data returned by the API.
 */
async function readHistory() {
  try {
    // Extract the session cookie from the cookie store
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    
    // Make the request using Axios; note that the response data is in response.data
    const response = await axiosInstance.get('/requests', {
      headers: {
        Authorization: sessionCookie ? `Bearer ${sessionCookie}` : '',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching requests:', error);
    throw error;
  }
}

export default async function Page() {
  try {
    // Fetch the history data
    const historyData = await readHistory();
    console.log(historyData)
    return (
      <div className="flex flex-col m-2">
        {/* Pass the fetched data to HistoryDataTable */}
        <HistoryDataTable initialData={historyData} />
      </div>
    );
  } catch (error) {
    console.error('Error rendering history page:', error);
    return <div>Error loading history</div>;
  }
}
