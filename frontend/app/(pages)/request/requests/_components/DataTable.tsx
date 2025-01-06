"use client";

import React from "react";
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { useDataTable } from "@/app/(pages)/request/requests/DataTableContext";
import DataTablePagination from "@/components/data-table/advanced/DataTablePagination";
import FilterBy from "@/components/data-table/advanced/FilterBy";
import Export from "@/components/data-table/advanced/Export";
import DateTimeFilter from "@/components/data-table/advanced/DateTimeFilter";
import FilterByInput from "@/components/data-table/advanced/FilterByInput";
import { getColumns } from "../_data";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    enableFiltering?: boolean;
    enableInputFiltering?: boolean;
  }
}

export function DataTable() {
  const {
    data = [], // Ensure data is always an array
    sorting,
    setSorting,
    globalFilter,
    columnFilters,
    setColumnFilters,
    rowSelection,
    setRowSelection,
  } = useDataTable();

  // Create the table instance
  const table = useReactTable({
    data: data.length > 0 ? data : [], // Fallback to an empty array
    columns: getColumns(setColumnFilters),
    state: {
      sorting,
      globalFilter,
      columnFilters,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="w-full overflow-x-auto">
      <div className="flex justify-between gap-4 mb-4">
        <div className="flex px-2 gap-2">
          {table
            .getAllColumns()
            .map(
              (column) =>
                column.columnDef.meta?.enableInputFiltering && (
                  <FilterByInput
                    key={column.id}
                    column={column}
                    table={table}
                  />
                )
            )}

          {table
            .getAllColumns()
            .map(
              (column) =>
                column.columnDef.meta?.enableFiltering && (
                  <FilterBy key={column.id} column={column} table={table} />
                )
            )}
        </div>

        <div className="flex gap-4">
          <Export />
          <DateTimeFilter columnId="age" setColumnFilters={setColumnFilters} />
        </div>
      </div>

      {data.length > 0 ? (
        <div className="flex flex-col gap-2">
          <table className="w-full border border-gray-200 rounded-lg">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-2 border-b bg-gray-100 text-center"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-100">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-2 border-b text-center"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <DataTablePagination table={table} />
        </div>
      ) : (
        <div className="text-center py-4">No data available.</div>
      )}
    </div>
  );
}
