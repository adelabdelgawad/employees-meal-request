'use client';

import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface ExportTableProps {
  data: Record<string, any>[];
  excludedRows?: string[]; // Optional prop to exclude specific rows
}

const ExportTable = ({ data, excludedRows = [] }: ExportTableProps) => {
  const handleExport = () => {
    if (data.length === 0) return;

    // Filter out the excluded rows if any
    const filteredData = excludedRows.length
      ? data.map((row) =>
          Object.fromEntries(
            Object.entries(row).filter(([key]) => !excludedRows.includes(key)),
          ),
        )
      : data;

    // Generate CSV content
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        Object.keys(filteredData[0]).join(','), // CSV headers
        ...filteredData.map((row) =>
          Object.values(row)
            .map((value) => `"${value}"`)
            .join(','),
        ),
      ].join('\n');

    // Create a download link and trigger the download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'table_data.csv');
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
