"use client";

import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Utility function to generate pagination range
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
      { key: "ellipsis-start", value: "..." },
      { key: totalPages - 1, value: totalPages - 1 },
      { key: totalPages, value: totalPages },
    ];
  }

  if (currentPage >= totalPages - dynamicRange) {
    return [
      { key: 1, value: 1 },
      { key: 2, value: 2 },
      { key: "ellipsis-end", value: "..." },
      ...Array.from({ length: dynamicRange + 2 }, (_, i) => ({
        key: totalPages - (dynamicRange + 1) + i,
        value: totalPages - (dynamicRange + 1) + i,
      })),
    ];
  }

  return [
    { key: 1, value: 1 },
    { key: "ellipsis-start", value: "..." },
    ...Array.from({ length: dynamicRange * 2 + 1 }, (_, i) => ({
      key: currentPage - dynamicRange + i,
      value: currentPage - dynamicRange + i,
    })),
    { key: "ellipsis-end", value: "..." },
    { key: totalPages, value: totalPages },
  ];
};

interface TablePaginationProps {
  totalPages: number;
}

const TablePagination = React.memo(({ totalPages }: TablePaginationProps) => {
  const searchParams = useSearchParams();
  const params = new URLSearchParams(searchParams?.toString() || "");

  const { replace } = useRouter();
  const pathname = usePathname();

  const currentPage = Number(params.get("page")) || 1;

  const allPages = generatePagination(currentPage, totalPages);

  const createPageURL = (page: number | string) => {
    params.set("page", page.toString());
    console.log(params.toString());
    return `${pathname}?${params.toString()}`;
  };

  return (
    <div>
      <div className="flex flex-nowrap gap-4">
        <Pagination>
          <PaginationContent>
            {/* Previous Button */}
            <PaginationItem>
              <PaginationPrevious
                href={currentPage > 1 ? createPageURL(currentPage - 1) : "#"}
                aria-disabled={currentPage <= 1}
                className={
                  currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>

            {/* Page Numbers */}
            {allPages.map(({ key, value }) => (
              <PaginationItem key={key}>
                {value === "..." ? (
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
              <PaginationNext
                href={
                  currentPage < totalPages
                    ? createPageURL(currentPage + 1)
                    : "#"
                }
                aria-disabled={currentPage >= totalPages}
                className={
                  currentPage >= totalPages
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
});

export default TablePagination;
