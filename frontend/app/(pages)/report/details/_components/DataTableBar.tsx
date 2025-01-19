import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Search, Printer } from 'lucide-react';

export default function DataTableBar() {
  return (
    <div>
      {' '}
      <div className="flex items-center justify-between bg-white p-4">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border rounded px-3 py-1">
            <Search className="w-4 h-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search active users list"
              className="border-none outline-none text-sm focus:ring-0 focus:border-transparent"
            />
          </div>
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
