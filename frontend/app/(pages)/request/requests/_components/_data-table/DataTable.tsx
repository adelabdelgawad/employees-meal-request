"use client";

import React from "react";
import { useDataTable } from "./DataTableContext";
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import DataTableRows from "./DataTableRows";
import DataTablePagination from "@/components/data-table/DataTablePagination";
import DataTableHeader from "./DataTableHeader";

export function DataTable() {
  const { table } = useDataTable();

  // Get the first filterable column
  const filterColumn = table
    .getAllColumns()
    .find((col) => col.columnDef.meta?.filterable);

  console.log(filterColumn);
  return (
    <div className="w-full overflow-x-auto">
      {filterColumn && <DataTableHeader column={filterColumn} />}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableCell
                  key={header.id}
                  className="text-center font-semibold"
                >
                  {header.isPlaceholder ? null : (
                    <div>
                      {typeof header.column.columnDef.header === "string"
                        ? header.column.columnDef.header
                        : typeof header.column.columnDef.header === "function"
                        ? header.column.columnDef.header(header.getContext())
                        : null}
                    </div>
                  )}
                </TableCell>
              ))}
              <TableCell className="text-center font-semibold">
                Actions
              </TableCell>
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          <DataTableRows />
        </TableBody>
      </Table>
      <DataTablePagination table={table} />
    </div>
  );
}
