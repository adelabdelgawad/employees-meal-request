import React from 'react';
import ExportTable from './DataTableExport';
import DataTableSearch from './DataTableSearch';
import DataTableDateRange from './DataTableDateRange';

export default function DataTableHeader() {
  return (
    <div>
      {/* Top Section */}
      <div className="flex items-center justify-between bg-white mb-5">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <DataTableSearch placeholder="Search Employee Name..." />
          <DataTableDateRange placeholder="Pick a Request date range" />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <ExportTable />
        </div>
      </div>
    </div>
  );
}
