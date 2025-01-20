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

interface TablePaginationProps {
  searchParams?: { query?: string; page?: string; page_size?: string }; // Add a type for searchParams
  totalPages: number;
}

export default function TablePagination({
  searchParams = {},
  totalPages,
}: TablePaginationProps) {
  const query = searchParams?.query || ''; // Default search query
  const currentPage = Number(searchParams?.page) || 1; // Default to page 1
  const pageSize = Number(searchParams?.page_size) || 20; // Default rows per page
  const allPages = generatePagination(currentPage, totalPages);

  const createPageURL = (page: number | string) =>
    `details?query=${encodeURIComponent(
      query,
    )}&page=${page}&page_size=${encodeURIComponent(pageSize)}`;

  return (
    <div>
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
