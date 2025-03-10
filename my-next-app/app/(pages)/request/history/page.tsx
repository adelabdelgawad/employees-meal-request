export const dynamic = "force-dynamic";

import axiosInstance from '@/lib/axiosInstance';
import HistoryDataTable from './_components/HistoryDataTable';

async function fetchUserHistory() {
  try {
    const response = await axiosInstance.get('/history');
    return response.data;
  } catch (error) {
    console.error('Error fetching history:', error);
    throw new Error('Failed to fetch history');
  }
}

export default async function Page() {
  try {
    const historyData = await fetchUserHistory();
    return (
      <div className="flex flex-col m-2">
        {/* Table */}
        <div>
          <HistoryDataTable initialData={historyData.data} />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error rendering history page:', error);
    return <div>Error loading history</div>;
  }
}
