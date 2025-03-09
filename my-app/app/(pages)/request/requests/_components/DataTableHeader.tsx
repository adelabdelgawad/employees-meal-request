"use client";

import React from "react";
import ExportTable from "@/components/data-table/DataTableExport";
import DataTableSearch from "@/components/data-table/DataTableSearch";
import DataTableDateRange from "@/components/data-table/DataTableRangePicker";
import LiveButton from "./LiveButton";
import RefreshWithCounter from "./RefreshWithCounter";
import { useSearchParams } from "next/navigation";

const DataTableHeader = () => {
  const searchParams = useSearchParams();
  const isLive = searchParams?.get("live") === "true"; // Check if Live mode is active
  
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
            {/* Show RefreshWithCounter only when Live mode is active */}
            {isLive && (
              <div className="flex justify-center">
                <RefreshWithCounter />
              </div>
            )}
            <LiveButton />
            <ExportTable />
          </div>
      </div>
    </div>
  );
};

export default DataTableHeader;