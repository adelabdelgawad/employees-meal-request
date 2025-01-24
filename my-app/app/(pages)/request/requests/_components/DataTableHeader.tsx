import React from "react";
import ExportTable from "@/components/data-table/DataTableExport";
import DataTableSearch from "@/components/data-table/DataTableSearch";
import DataTableDateRange from "@/components/data-table/DataTableRangePicker";

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
