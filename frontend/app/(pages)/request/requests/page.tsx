"use client";

import React from "react";
import { DataTable } from "./DataTable";
import { DataTableProvider } from "@/app/(pages)/request/requests/_components/_data-table/DataTableContext";

export default function Page() {
  return (
    <DataTableProvider>
      <DataTable />
    </DataTableProvider>
  );
}
