"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface ExportTableProps {
  data: Record<string, any>[];
}

const ExportTable = ({ data }: ExportTableProps) => {
  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        Object.keys(data[0]).join(","), // CSV headers
        ...data.map((row) =>
          Object.values(row)
            .map((value) => `"${value}"`)
            .join(",")
        ),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "table_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport}>
      <Download className="mr-2 h-4 w-4" />
      Export CSV
    </Button>
  );
};

export default ExportTable;
