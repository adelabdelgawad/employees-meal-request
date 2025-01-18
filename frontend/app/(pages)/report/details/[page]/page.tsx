import { Suspense } from 'react';
import { Skeleton } from '@/components/Skeleton';
import Search from '@/components/search';
import ReportDetailsTable from '../_components/table';

export default function Page({
  searchParams,
  params,
}: {
  searchParams?: { query?: string; page?: string };
  params: { page: string };
}) {
  const query = searchParams?.query || '';
  const currentPage = Number(params.page) || 1;

  return (
    <div className="w-full overflow-x-auto">
      <Search placeholder="Search..." query={query} />
      <Suspense key={query + currentPage} fallback={<Skeleton />}>
        <ReportDetailsTable query={query} currentPage={currentPage} />
      </Suspense>
    </div>
  );
}
