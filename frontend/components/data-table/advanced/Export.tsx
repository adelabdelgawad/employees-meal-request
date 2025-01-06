"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function Export() {
  const handleExport = () => {
    // Logic to export table data
    console.log("Exporting data...");
  };

  return (
    <Button onClick={handleExport} variant="outline">
      <Download className="mr-2 h-4 w-4" /> Export
    </Button>
  );
}
