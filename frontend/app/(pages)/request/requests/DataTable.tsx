"use client";

import React, { useEffect, useState } from "react";
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { useDataTable } from "@/app/(pages)/request/requests/RequestTableContext";
import DataTablePagination from "@/app/(pages)/request/requests/_components/_table/DataTablePagination";
import FilterBy from "@/app/(pages)/request/requests/_components/_table/FilterBy";
import Export from "@/app/(pages)/request/requests/_components/_table/Export";
import FilterByInput from "@/app/(pages)/request/requests/_components/_table/FilterByInput";
import { DateRangePicker } from "@/app/(pages)/request/requests/_components/_table/DateRangePicker";

import { getColumns } from "./_data";
import { Actions } from "./_components/_actions/Actions";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    enableFiltering?: boolean;
    enableInputFiltering?: boolean;
  }
}

export function DataTable() {
  const {
    data,
    setFrom,
    setTo,
    columnFilters,
    setColumnFilters,
    rowSelection,
    setRowSelection,
  } = useDataTable();

  // Precompute unique values for filters
  const uniqueValuesMap = React.useMemo(() => {
    const uniqueValues: Record<string, { value: string; count: number }[]> = {};
    data.forEach((row) => {
      Object.entries(row).forEach(([key, value]) => {
        if (!uniqueValues[key]) uniqueValues[key] = [];
        const existing = uniqueValues[key].find(
          (item) => item.value === String(value)
        );
        if (existing) {
          existing.count += 1;
        } else {
          uniqueValues[key].push({ value: String(value), count: 1 });
        }
      });
    });
    return uniqueValues;
  }, [data]);

  const table = useReactTable({
    data: data.length > 0 ? data : [],
    columns: getColumns(setColumnFilters),
    state: {
      columnFilters,
      rowSelection,
    },
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
          {/* Render Input Filters */}
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

          {/* Render Dropdown Filters */}
          {table
            .getAllColumns()
            .map(
              (column) =>
                column.columnDef.meta?.enableFiltering && (
                  <FilterBy
                    key={column.id}
                    column={column}
                    uniqueValues={uniqueValuesMap[column.id] || []}
                  />
                )
            )}
        </div>

        <div className="flex gap-4">
          <Export tableData={data} />
          <DateRangePicker
            placeholder="Select a request time range"
            setFrom={setFrom}
            setTo={setTo}
          />
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
                  <th className="px-4 py-2 border-b bg-gray-100 text-center">
                    Actions
                  </th>
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.original.id}
                  className="hover:bg-gray-100 items-center"
                >
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
                  <td className="py-2 border-b justify-center">
                    <Actions
                      rowId={row.original.id}
                      requestStatusName={row.original.status}
                    />
                  </td>
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
``;
