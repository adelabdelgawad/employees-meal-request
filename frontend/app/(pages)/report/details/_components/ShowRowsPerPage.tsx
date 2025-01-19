'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'; // Adjust path accordingly

interface ShowRowsPerPageProps {
  rowsPerPage: number;
}

export default function ShowRowsPerPage({ rowsPerPage }: ShowRowsPerPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Fallback to default if searchParams is null
  const currentSize = searchParams?.get('page_size') || rowsPerPage.toString();

  const handleValueChange = (newSize: string) => {
    // Create URLSearchParams safely even if searchParams is null
    const params = new URLSearchParams(
      searchParams ? Array.from(searchParams.entries()) : [],
    );
    params.set('page_size', newSize);
    params.set('page', '1'); // Reset to first page upon change
    router.push(`/report/details?${params.toString()}`);
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
          {['5', '10', '20', '50'].map((size) => (
            <SelectItem key={size} value={size}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
