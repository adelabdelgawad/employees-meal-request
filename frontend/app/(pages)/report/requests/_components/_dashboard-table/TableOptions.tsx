import React from "react";
import SearchInput from "@/components/data-table/SearchInput";
import ComboBoxFilter from "@/components/data-table/ComboBoxFilter";
import ExportTable from "@/components/data-table/ExportTable";
import PrintTable from "@/components/data-table/PrintTable";
import { RequestRecord } from "@/pages/definitions";
import { DateRangePicker } from "@/components/data-table/DateRangePicker";

interface TableOptionsProps {
  data: RequestRecord[];
  fromDate: Date;
  toDate: Date;
  setFromDate: (value: Date) => void;
  setToDate: (value: Date) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  statusFilter: string[];
  setStatusFilter: (values: string[]) => void;
  statusOptions: { value: string; count: number }[];
}

export default function TableOptions({
  data,
  fromDate,
  toDate,
  setFromDate,
  setToDate,
  searchQuery,
  setSearchQuery,
}: TableOptionsProps) {
  // Dynamically filter out the "status_id" field from columns
  const columns = Object.keys(data[0] || {}).filter(
    (key) => key !== "status_id"
  );

  // Dynamically filter out "status_id" from data
  const filteredData = data.map(({ status_id, ...rest }) => rest);

  return (
    <>
      {/* Date Range Picker */}
      <div className="flex justify-end mb-5">
        <div className="flex flex-col items-center gap-2">
          <DateRangePicker
            initialDateFrom={fromDate}
            initialDateTo={toDate}
            setFrom={setFromDate}
            setTo={setToDate}
          />
        </div>
      </div>

      {/* Top Section: Search and Filters */}
      <div className="flex items-center justify-between mb-4">
        {/* Left Section: Search and Filters */}
        <div className="flex items-center gap-4">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by requester..."
          />
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-4">
          {/* Export Table with Filtered Data */}
          <ExportTable data={filteredData} />

          {/* Print Table with Filtered Columns */}
          <PrintTable columns={columns} data={filteredData} />
        </div>
      </div>
    </>
  );
}
