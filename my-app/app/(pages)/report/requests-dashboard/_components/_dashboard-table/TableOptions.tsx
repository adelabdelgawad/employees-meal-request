import DataTableRangePicker from "@/components/data-table/DataTableRangePicker";
import { useReportRequest } from "@/hooks/ReportRequestContext";
import React from "react";

export default function TableOptions() {
  const { setFromDate, setToDate, requests, searchQuery, setSearchQuery } =
    useReportRequest();

  // Filtered data for exporting
  const filteredData = requests.map(({ id, ...rest }) => rest);
  console.log(filteredData);

  return (
    <>
      <div className="flex justify-end mb-2">
        <DataTableRangePicker setFrom={setFromDate} setTo={setToDate} />
      </div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by requester..."
          />
        </div>

        <div className="flex items-center gap-4">
          <ExportTable data={filteredData} excludedRows={["id"]} />
          <PrintTable
            columns={Object.keys(filteredData[0] || {})}
            data={filteredData}
          />
        </div>
      </div>
    </>
  );
}
