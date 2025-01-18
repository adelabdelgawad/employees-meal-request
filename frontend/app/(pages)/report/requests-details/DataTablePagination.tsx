import Link from 'next/link';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

// Define the props for PaginationLink
type PaginationLinkProps = {
  isActive?: boolean;
} & React.ComponentProps<typeof Link>;

const PaginationLink: React.FC<PaginationLinkProps> = ({
  isActive,
  children,
  ...props
}) => (
  <PaginationItem>
    <Link {...props} className={`pagination-link ${isActive ? 'active' : ''}`}>
      {children}
    </Link>
  </PaginationItem>
);

import React from 'react';

export default function DataTablePagination() {
  const pages = [1, 2, 3, 4, 5]; // Example page numbers

  return (
    <Pagination>
      <PaginationContent>
        {/* Previous Button */}
        <PaginationItem>
          <PaginationPrevious>
            <Link href="/page/1" className="pagination-previous">
              « Previous
            </Link>
          </PaginationPrevious>
        </PaginationItem>

        {/* Page Numbers */}
        {pages.map((page) => (
          <PaginationLink
            key={page}
            href={`/page/${page}`}
            isActive={page === 1} // Example of marking the first page as active
          >
            {page}
          </PaginationLink>
        ))}

        {/* Ellipsis */}
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>

        {/* Next Button */}
        <PaginationItem>
          <PaginationNext>
            <Link href="/page/2" className="pagination-next">
              Next »
            </Link>
          </PaginationNext>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
