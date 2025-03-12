'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface TablePaginationProps {
  /** The current active page number */
  currentPage: number;
  /** The total number of pages available */
  totalPages: number;
}

/**
 * Constructs an href URL for the given page, preserving existing query parameters.
 *
 * @param page - The target page number.
 * @param pathname - The current path.
 * @param searchParams - The current search parameters.
 * @returns A URL string with the updated page query.
 */
function buildHref(page: number, pathname: string, searchParams: URLSearchParams): string {
  const params = new URLSearchParams(searchParams.toString());
  params.set('page', page.toString());
  return `${pathname}?${params.toString()}`;
}

/**
 * A dynamic pagination component using ShadCN UI components.
 *
 * Generates previous, next, and numbered links with ellipsis when necessary.
 *
 * @param {TablePaginationProps} props - The component props.
 * @returns {JSX.Element} The rendered pagination component.
 */
export function TablePagination({ currentPage, totalPages }: TablePaginationProps) {
  const pathname = usePathname() || '';
  const searchParams = useSearchParams() || new URLSearchParams();

  // Determine which page numbers to display.
  // For small totalPages, display all pages; otherwise, display ellipsis where appropriate.
  let pages: (number | 'ellipsis')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Always show the first page.
    pages.push(1);

    if (currentPage > 4) {
      pages.push('ellipsis');
    }

    // Show pages around the current page.
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 3) {
      pages.push('ellipsis');
    }

    // Always show the last page.
    pages.push(totalPages);
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            href={
              currentPage > 1
                ? buildHref(currentPage - 1, pathname!, searchParams!)
                : '#'
            }
          />
        </PaginationItem>
        {pages.map((item, idx) => (
          <PaginationItem key={idx}>
            {item === 'ellipsis' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                href={buildHref(item, pathname!, searchParams!)}
                isActive={item === currentPage}
              >
                {item}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext 
            href={
              currentPage < totalPages
                ? buildHref(currentPage + 1, pathname!, searchParams!)
                : '#'
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
