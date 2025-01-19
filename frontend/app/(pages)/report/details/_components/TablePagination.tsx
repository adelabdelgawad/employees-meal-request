/**
 * @file table-pagination.tsx
 * @description A pagination component that uses shared Pagination UI and includes rows-per-page selection.
 */

'use client'; // Ensure client usage if using client components like ShowRowsPerPage

import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

import ShowRowsPerPage from './ShowRowsPerPage';

interface TablePaginationProps {
  query: string;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  totalRows: number;
  rowsPerPage: number;
}

/**
 * Renders a pagination control along with a rows-per-page selector.
 *
 * @param {string} query - The current search query.
 * @param {number} currentPage - The current page number (1-based).
 * @param {number} totalPages - The total number of pages available.
 * @returns {JSX.Element} A pagination UI component integrated with a rows-per-page selector.
 */
export default function TablePagination({
  query,
  pageSize,
  currentPage,
  totalPages,
  totalRows,
  rowsPerPage,
}: TablePaginationProps) {
  const allPages = generatePagination(currentPage, totalPages);

  const createPageURL = (page: number | string) =>
    `details?query=${encodeURIComponent(
      query,
    )}&page=${page}&page_size=${encodeURIComponent(pageSize)}`;

  return (
    <div className="flex justify-between items-center">
      {/* Rows per page selector */}
      <div>
        <ShowRowsPerPage rowsPerPage={rowsPerPage} />
      </div>
      {/* Pagination Controls */}
      <div className="flex flex-nowrap gap-4">
        <Pagination>
          <PaginationContent>
            {/* Previous Button */}
            <PaginationItem>
              {currentPage > 1 ? (
                <PaginationPrevious href={createPageURL(currentPage - 1)} />
              ) : (
                <PaginationPrevious
                  href="#"
                  aria-disabled="true"
                  className="pointer-events-none opacity-50"
                />
              )}
            </PaginationItem>

            {/* Page Numbers */}
            {allPages.map(({ key, value }) => (
              <PaginationItem key={key}>
                {value === '...' ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    href={createPageURL(value)}
                    isActive={currentPage === value}
                  >
                    {value}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            {/* Next Button */}
            <PaginationItem>
              {currentPage < totalPages ? (
                <PaginationNext href={createPageURL(currentPage + 1)} />
              ) : (
                <PaginationNext
                  href="#"
                  aria-disabled="true"
                  className="pointer-events-none opacity-50"
                />
              )}
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
      <div>
        <span className="text-sm">
          Page {currentPage} of {totalPages} — Total rows: {totalRows}
        </span>
      </div>
    </div>
  );
}

export const generatePagination = (currentPage: number, totalPages: number) => {
  const dynamicRange = 2;

  if (totalPages <= dynamicRange * 2 + 3) {
    return Array.from({ length: totalPages }, (_, i) => ({
      key: i + 1,
      value: i + 1,
    }));
  }

  if (currentPage <= dynamicRange + 1) {
    return [
      ...Array.from({ length: dynamicRange + 2 }, (_, i) => ({
        key: i + 1,
        value: i + 1,
      })),
      { key: 'ellipsis-start', value: '...' },
      { key: totalPages - 1, value: totalPages - 1 },
      { key: totalPages, value: totalPages },
    ];
  }

  if (currentPage >= totalPages - dynamicRange) {
    return [
      { key: 1, value: 1 },
      { key: 2, value: 2 },
      { key: 'ellipsis-end', value: '...' },
      ...Array.from({ length: dynamicRange + 2 }, (_, i) => ({
        key: totalPages - (dynamicRange + 1) + i,
        value: totalPages - (dynamicRange + 1) + i,
      })),
    ];
  }

  return [
    { key: 1, value: 1 },
    { key: 'ellipsis-start', value: '...' },
    ...Array.from({ length: dynamicRange * 2 + 1 }, (_, i) => ({
      key: currentPage - dynamicRange + i,
      value: currentPage - dynamicRange + i,
    })),
    { key: 'ellipsis-end', value: '...' },
    { key: totalPages, value: totalPages },
  ];
};
