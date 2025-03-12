"use client";

import * as React from "react";
import { Download as DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchReportDetails } from "@/lib/services/report-details";

interface DownloadProps {
  query?: string;
  startDate?: string;
  endDate?: string;
  filename?: string;
}

/**
 * A Download component that fetches report data from the backend
 * and triggers a file download in CSV format.
 *
 * @param query - Search query parameter.
 * @param startDate - Start date filter.
 * @param endDate - End date filter.
 * @param filename - The name of the downloaded file (default: "data.csv").
 */
export function Download({ query = "", startDate = "", endDate = "", filename = "data.csv" }: DownloadProps) {
  
  // Function to convert JSON response to CSV format
  const convertToCSV = (data: any[]): string => {
    if (!data || data.length === 0) return "";

    const headers = Object.keys(data[0]); // Extract column headers
    const csvRows = [];

    // Add header row
    csvRows.push(headers.join(","));

    // Convert each row
    data.forEach((row) => {
      const values = headers.map((header) => {
        const value = row[header] !== undefined ? row[header] : "";
        return `"${String(value).replace(/"/g, '""')}"`; // Escape quotes
      });
      csvRows.push(values.join(","));
    });

    return csvRows.join("\n");
  };

  const handleDownload = async () => {
    try {
      // Fetch report details from the backend
      const response = await fetchReportDetails(query, undefined, startDate, endDate, false);
      
      if (!response || !response.request_lines) {
        throw new Error("No data returned from the server");
      }
  
      // Convert response JSON to CSV
      const csvData = convertToCSV(response.request_lines);
  
      // Add UTF-8 BOM to support Arabic characters
      const utf8BOM = "\uFEFF" + csvData;
      const blob = new Blob([utf8BOM], { type: "text/csv;charset=utf-8;" });
  
      // Create a downloadable link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
  
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Error downloading file. Please try again.");
    }
  };
  

  return (
    <Button variant="outline" onClick={handleDownload}>
      <DownloadIcon className="mr-2 h-4 w-4" />
      Download
    </Button>
  );
}
