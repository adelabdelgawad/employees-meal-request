// app/page.tsx
import React from 'react';
import DataTableHeader from './_components/DataTableHeader';
import DataTable from './_components/DataTable';
import { getHistoryRequests } from '@/lib/services/request-history';

export default async function Page() {
  try {
    const data = await getHistoryRequests();

    return (
      <div className="flex flex-col m-2">
        {/* Header */}
        <div>
          <DataTableHeader />
        </div>

        {/* Table */}
        <div>
          <DataTable initialData={data.data} />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error rendering page:', error);
    // Handle error appropriately, e.g., show an error message or redirect
    return <div>Error loading data</div>;
  }
}
