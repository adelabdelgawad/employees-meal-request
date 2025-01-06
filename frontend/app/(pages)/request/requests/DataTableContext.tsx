"use client";

import React, { createContext, useContext, useState } from "react";
import {
  useReactTable,
  SortingState,
  ColumnFiltersState,
  RowSelectionState,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  Table,
} from "@tanstack/react-table";
import { RequestRecord } from "@/lib/definitions";
import { data, getColumns } from "./_data";

interface DataTableContextProps {
  data: RequestRecord[];
  table: Table<RequestRecord>;
  sorting: SortingState;
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>;
  globalFilter: string;
  setGlobalFilter: React.Dispatch<React.SetStateAction<string>>;
  columnFilters: ColumnFiltersState;
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
  rowSelection: RowSelectionState;
  setRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>;
  toggleColumnVisibility: (id: string) => void;
}

const DataTableContext = createContext<DataTableContextProps | undefined>(
  undefined
);

export const DataTableProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const columns = getColumns(setColumnFilters);

  // Create the table instance
  const table = useReactTable({
    data,
    columns,
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

  const toggleColumnVisibility = (id: string) => {
    table.getAllColumns().forEach((col) => {
      if (col.id === id) {
        col.toggleVisibility();
      }
    });
  };

  return (
    <DataTableContext.Provider
      value={{
        data,
        table,
        toggleColumnVisibility,
        sorting,
        setSorting,
        globalFilter,
        setGlobalFilter,
        columnFilters,
        setColumnFilters,
        rowSelection,
        setRowSelection,
      }}
    >
      {children}
    </DataTableContext.Provider>
  );
};

export const useDataTable = () => {
  const context = useContext(DataTableContext);
  if (!context) {
    throw new Error("useDataTable must be used within a DataTableProvider");
  }
  return context;
};

