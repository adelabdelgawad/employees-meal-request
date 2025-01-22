'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSearchParams } from 'next/navigation';
import { fetchReportDetails } from '@/lib/services/report-details';

export default function ExportTable({
  excludedRows = [],
}: {
  excludedRows?: string[];
}) {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();

  // Helper function to generate CSV
  const generateCSV = (data: any[], excludedRows: string[]) => {
    const filteredData = excludedRows.length
      ? data.map((row) =>
          Object.fromEntries(
            Object.entries(row).filter(([key]) => !excludedRows.includes(key)),
          ),
        )
      : data;

    const headers = Object.keys(filteredData[0]).join(',');
    const rows = filteredData.map((row) =>
      Object.values(row)
        .map(
          (value) =>
            // Escape double quotes and handle non-ASCII characters
            `"${String(value).replace(/"/g, '""')}"`,
        )
        .join(','),
    );

    // Add BOM to ensure UTF-8 encoding
    return `\uFEFF${[headers, ...rows].join('\n')}`;
  };

  // Helper function to download file
  const downloadFile = (content: string, fileName: string) => {
    const blob = new Blob([content], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // Handle export button click
  const handleExport = async () => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    const query = params.get('query') || '';
    const currentPage = Number(params.get('page')) || 1;
    const pageSize = Number(params.get('page_size')) || 20;

    try {
      setIsLoading(true);

      const response = await fetchReportDetails(
        query,
        undefined,
        undefined,
        true,
      );

      if (
        !response ||
        !Array.isArray(response.data) ||
        response.data.length === 0
      ) {
        console.warn('No data found to export.');
        return;
      }

      const csvContent = generateCSV(response.data, excludedRows);
      downloadFile(csvContent, 'table_data.csv');
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
