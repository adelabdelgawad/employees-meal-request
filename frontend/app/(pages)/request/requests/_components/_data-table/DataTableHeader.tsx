import FilterByInput from "@/components/data-table/FilterByInput";
import React from "react";
import { Column } from "@tanstack/react-table";

interface DataTableHeaderProps<TData> {
  column: Column<TData, unknown>;
}

export default function DataTableHeader<TData>({
  column,
}: DataTableHeaderProps<TData>) {
  return (
    <div className="flex items-center justify-between mb-4 p-2">
      <FilterByInput column={column} />
      <h1 className="text-xl font-bold">Data Table</h1>
    </div>
  );
}
