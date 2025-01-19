/**
 * @file page.tsx
 * @description Next.js Server Component page that fetches data and renders a paginated table with rows-per-page selection.
 */

import { Suspense } from 'react';
import TablePagination from './TablePagination';
import { TableSkeleton } from './TableSkeleton';
import SearchBar from './SearchBar';
import { DataTableBody, ErrorDataTableBody } from './DataTableBody';

/**
 * Asynchronous function for fetching table data from your backend API.
 *
 * @param {string} query - The search or filter query string.
 * @param {number} currentPage - The current page number (1-based).
 * @param {number} pageSize - The number of rows per page.
 * @returns {Promise<any>} A Promise resolving to the JSON data from the API.
 * @throws Will throw an error if the fetch fails or the response is not OK.
 */
const fetchData = async (
  query: string,
  currentPage: number,
  pageSize: number,
) => {
  try {
    const res = await fetch(
      `http://localhost:8000/report-details?search=${query}&page=${currentPage}&page_size=${pageSize}`,
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
};

/**
 * Default export: a Next.js "server component" for the report/details route.
 * This page is server-rendered, and it fetches data via fetchData above.
 *
 * @param {object} props - The props object automatically passed by Next.js.
 * @param {Promise<{ query?: string; page?: string; page_size?: string }>} props.searchParams - Search parameters from the URL.
 * @returns {JSX.Element} The rendered page.
 */
export default async function DataTable(props: {
  searchParams?: Promise<{ query?: string; page?: string; page_size?: string }>;
}) {
  // 1. Parse search parameters:
  const searchParams = await props.searchParams;
  const query = searchParams?.query || ''; // Default search query
  const currentPage = Number(searchParams?.page) || 1; // Default to page 1
  const pageSize = Number(searchParams?.page_size) || 20; // Default rows per page

  // 2. Fetch data (server-side)
  let data;

  try {
    data = await fetchData(query, currentPage, pageSize);
  } catch (error) {
    data = null;
  }

  // 3. Use totalPages from fetched data if available, otherwise fallback.
  const totalPages = data?.total_pages || 1;

  // ...
  return (
    <div className="w-full">
      {/* Search Bar */}
      <div className="my-4 flex items-center justify-between gap-2 md:mt-8">
        <SearchBar placeholder="Search Employee Name..." />
      </div>

      {/* Data Table */}
      <Suspense
        key={query + currentPage + pageSize}
        fallback={<TableSkeleton />}
      >
        {data ? <DataTableBody items={data.data} /> : <ErrorDataTableBody />}
      </Suspense>

      {/* Pagination and Rows-per-Page */}
      {data && (
        <div className="m-5 ">
          <TablePagination
            query={query}
            pageSize={pageSize}
            totalRows={data.total_count}
            currentPage={currentPage}
            totalPages={totalPages}
            rowsPerPage={20}
          />
        </div>
      )}
    </div>
  );
}
