"use client";

import React from "react";
import { DataTable } from "./_components/_data-table/DataTable";
import { DataTableProvider } from "@/app/(pages)/request/requests/_components/_data-table/DataTableContext";
import { AlertsProvider } from "@/components/alert/useAlerts";
import AlertStack from "@/components/alert/AlertStack";

export default function Page() {
  return (
    <AlertsProvider>
      <DataTableProvider>
        <DataTable />
        <AlertStack />
      </DataTableProvider>
    </AlertsProvider>
  );
}
