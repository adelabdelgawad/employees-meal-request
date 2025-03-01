"use client";
import ExportTable from "@/components/data-table/DataTableExport";
import DataTableRangePicker from "@/components/data-table/DataTableRangePicker";
import DataTableSearch from "@/components/data-table/DataTableSearch";
import { URLSwitch } from "@/components/url-switch";
import React, { useState } from "react";

export default function DataTableHeader() {
  const [isActive, setIsActive] = useState(false);

  return (
    <div>
      {/* Top Section */}
      <div className="flex items-center justify-between bg-white mb-5">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <DataTableSearch placeholder="Search Employee Name..." />
          <DataTableRangePicker placeholder="Pick a Request date range" />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <URLSwitch
            placeholder="Update Attendance"
            value={isActive}
            setValue={setIsActive}
            paramName="update_attendance"
            className="my-4"
          />
          <ExportTable />
        </div>
      </div>
    </div>
  );
}
