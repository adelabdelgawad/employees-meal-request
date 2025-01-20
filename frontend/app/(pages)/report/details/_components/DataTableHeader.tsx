import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Search, Printer } from 'lucide-react';
import TableSearchBar from './TableSearchBar';

interface DataTableHeaderProps {
  searchParams?: { query?: string; page?: string; page_size?: string };
}

export default function DataTableHeader({
  searchParams = {},
}: DataTableHeaderProps) {
  return (
    <div>
      <div className="flex items-center justify-between bg-white mb-5">
        {/* Left Section */}
        {/* Search Bar */}
        <div className="flex items-center gap-4">
          <TableSearchBar placeholder="Search Employee Name..." />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span>Export List</span>
          </Button>

          <Button variant="ghost" className="flex items-center gap-2">
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
