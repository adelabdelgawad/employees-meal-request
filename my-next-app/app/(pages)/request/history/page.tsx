export const dynamic = "force-dynamic"

// page.tsx
import React from 'react'
import { Suspense } from "react";
import TableSkelton from "@/components/Table/table-skelton";
import TableWithSWR from './TableWithSWR';
import { getHistoryRequests } from '@/lib/actions/request-history';

interface PageProps {
  searchParams: {
    page?: string;

  };
}


async function page({ searchParams }: PageProps) {
  // Extract query parameters
  const page = Number(searchParams?.page) || 1;

  // Fetch initial data on the server.
  const response: RequestsResponse | null = await getHistoryRequests(
    page,
  );

  return (
    <div className="w-full p-2 pt-5">
      <div className="flex w-full items-center justify-between"></div>
      <Suspense fallback={<TableSkelton />}>
        <TableWithSWR fallbackData={response} currentPage={page} />
      </Suspense>
    </div>
  );
}

export default page
