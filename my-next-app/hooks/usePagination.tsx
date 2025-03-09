'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useCallback } from 'react';

export function usePagination(defaultPage = 1, defaultRowsPerPage = 10) {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get current page and rows per page from URL or use defaults
  const currentPage = Math.max(
    1,
    parseInt(searchParams?.get('page') || `${defaultPage}`, 10),
  );
  const rowsPerPage = Math.max(
    5,
    parseInt(searchParams?.get('rowsPerPage') || `${defaultRowsPerPage}`, 10),
  );

  // Update page
  const setPage = useCallback(
    (page: number) => {
      router.push(`?page=${page}&rowsPerPage=${rowsPerPage}`);
    },
    [router, rowsPerPage],
  );

  // Update rows per page
  const setRowsPerPage = useCallback(
    (rows: number) => {
      router.push(`?page=1&rowsPerPage=${rows}`);
    },
    [router],
  );

  return { currentPage, rowsPerPage, setPage, setRowsPerPage };
}
