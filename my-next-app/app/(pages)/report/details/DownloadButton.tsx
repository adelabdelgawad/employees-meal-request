"use client";

import { Button } from "@/components/ui/button";
import { Download as DownloadIcon } from "lucide-react";
import { fetchReportDetails } from "@/lib/services/report-details";
import { tableDownload } from "@/components/Table/table-download";

interface DownloadButtonProps {
  query: string;
  page: number;
  startDate: string;
  endDate: string;
}

export default function DownloadButton({
  query,
  page,
  startDate,
  endDate,
}: DownloadButtonProps) {
  async function handleDownload() {
    console.log("Inside download");
    const download = true;
    const response = await fetchReportDetails(query, page, startDate, endDate, download);
    if (response?.request_lines) {
      await tableDownload(response.request_lines);
    }
  }

  return (
    <Button variant="outline" onClick={handleDownload}>
      <DownloadIcon className="mr-2 h-4 w-4" />
      Download
    </Button>
  );
}
