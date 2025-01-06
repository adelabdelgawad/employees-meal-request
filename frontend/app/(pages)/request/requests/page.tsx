"use client";

import * as React from "react";
import { DataTable } from "./_components/DataTable";
import { DataTableProvider } from "@/app/(pages)/request/requests/DataTableContext";

export default function Page() {
  return (
    <DataTableProvider>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Data Table</h1>
        <DataTable />
      </div>
    </DataTableProvider>
  );
}
