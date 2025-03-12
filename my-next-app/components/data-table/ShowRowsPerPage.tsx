"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"; // Adjust path accordingly

interface ShowRowsPerPageProps {
  rowsPerPage: number;
  onRowsPerPageChange?: (rows: number) => void;
}

export default function ShowRowsPerPage({ rowsPerPage, onRowsPerPageChange }: ShowRowsPerPageProps) {
  const { replace } = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Fallback to default if searchParams is null
  const currentSize = searchParams?.get("page_size") || rowsPerPage.toString();

  const handleValueChange = (newSize: string) => {
    // Create URLSearchParams safely even if searchParams is null
    const params = new URLSearchParams(searchParams?.toString() || "");

    params.set("page_size", newSize);
    params.set("page", "1"); // Reset to first page upon change

    replace(`${pathname}?${params.toString()}`);

    if (onRowsPerPageChange) {
      onRowsPerPageChange(parseInt(newSize, 10));
    }
  };

  return (
    <div className="flex flex-nowrap items-center gap-2">
      <span className="text-sm font-medium pointer-events-none opacity-50">
        Rows per page
      </span>
      <Select
        value={currentSize}
        onValueChange={handleValueChange}
        aria-label="Rows per page"
      >
        {/* Removed fixed width to prevent line breaks */}
        <SelectTrigger id="rows-per-page" className="w-auto">
          <SelectValue placeholder="Select rows" />
        </SelectTrigger>
        <SelectContent>
          {["5", "10", "20", "50"].map((size) => (
            <SelectItem key={size} value={size}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
