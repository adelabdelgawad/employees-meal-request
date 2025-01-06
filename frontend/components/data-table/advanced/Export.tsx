"use client";

import * as React from "react";
import { DownloadIcon } from "@radix-ui/react-icons";
import * as Tooltip from "@radix-ui/react-tooltip";

export default function Export({ tableData }: { tableData: any[] }) {
  const handleExport = () => {
    if (!tableData || tableData.length === 0) {
      console.log("No data to export.");
      return;
    }

    // Convert data to CSV
    const headers = Object.keys(tableData[0]);
    const csvRows = [
      headers.join(","), // Header row
      ...tableData.map((row) =>
        headers.map((header) => `"${row[header]}"`).join(",")
      ),
    ];
    const csvContent = csvRows.join("\n");

    // Create a Blob and download the file
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "export.csv";
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-gray-200 border rounded-md text-sm font-medium hover:bg-gray-300"
          >
            <DownloadIcon className="mr-2 h-4 w-4" /> Export
          </button>
        </Tooltip.Trigger>
        <Tooltip.Content
          className="bg-gray-800 text-white p-2 rounded shadow-md"
          side="top"
        >
          Export table data as CSV
        </Tooltip.Content>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
