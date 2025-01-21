import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import TableSearchBar from './TableSearchBar';
import ExportTable from './DataTableExport';

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
          {/* Download */}
          <ExportTable searchParams={searchParams} />
          <Button variant="ghost" className="flex items-center gap-2">
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
