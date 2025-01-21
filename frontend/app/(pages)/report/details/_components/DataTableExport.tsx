'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchReportDetails } from '@/lib/services/report-details';

interface ExportTableProps {
  excludedRows?: string[];
  searchParams?: { query?: string; page?: string; page_size?: string };
}

interface ExportTableProps {
  excludedRows?: string[];
  searchParams?: { query?: string; page?: string; page_size?: string };
}

// Utility to sanitize query parameters
const sanitizeParams = (params: Record<string, any>): string => {
  return Object.entries(params)
    .filter(([, value]) => value != null) // Exclude null or undefined values
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join('&');
};

export default function ExportTable({
  searchParams,
  excludedRows = [],
}: ExportTableProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Handle export button click
  const handleExport = async () => {
    setIsLoading(true);

    try {
      // Sanitize search parameters
      const queryString = searchParams ? sanitizeParams(searchParams) : '';

      // Fetch data
      const response = await fetchReportDetails(
        queryString,
        undefined,
        undefined,
        true,
      );

      // Validate and check the response
      if (
        !response ||
        !Array.isArray(response.data) ||
        response.data.length === 0
      ) {
        console.warn('No data found to export.');
        return;
      }

      // Filter out excluded rows (if any)
      const filteredData = excludedRows.length
        ? response.data.map((row) =>
            Object.fromEntries(
              Object.entries(row).filter(
                ([key]) => !excludedRows.includes(key),
              ),
            ),
          )
        : response.data;

      // Generate CSV content
      const headers = Object.keys(filteredData[0]).join(',');
      const rows = filteredData.map((row) =>
        Object.values(row)
          .map((value) => `"${value}"`)
          .join(','),
      );
      const csvContent = [headers, ...rows].join('\n');

      // Create a Blob with UTF-8 encoding
      const blob = new Blob([`\uFEFF${csvContent}`], {
        type: 'text/csv;charset=utf-8;',
      });

      // Trigger file download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'table_data.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Revoke URL
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting table:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      className="flex items-center gap-2"
      onClick={handleExport}
      disabled={isLoading}
    >
      <Download className="w-4 h-4" />
      <span>{isLoading ? 'Exporting...' : 'Export List'}</span>
    </Button>
  );
}
