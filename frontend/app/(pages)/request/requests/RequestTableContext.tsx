"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
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
import { getColumns } from "@/app/(pages)/request/requests/_data";
import { getRequests } from "@/app/_lib/data-fetcher";

interface DataTableContextProps {
  data: RequestRecord[];
  table: Table<RequestRecord>;
  setFrom: (date: Date | undefined) => void;
  setTo: (date: Date | undefined) => void;
  columnFilters: ColumnFiltersState;
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
  rowSelection: RowSelectionState;
  setRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>;
}

const DataTableContext = createContext<DataTableContextProps | undefined>(
  undefined
);

export const DataTableProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const columns = getColumns(setColumnFilters);
  const [data, setData] = useState<RequestRecord[]>([]);
  const [from, setFrom] = useState<Date | undefined>(undefined);
  const [to, setTo] = useState<Date | undefined>(undefined);

  // ✅ Refetch data when date range changes or on first page load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const requests = await getRequests(from, to);
        setData(requests);
      } catch (error) {
        console.error("Failed to fetch requests:", error);
      }
    };

    fetchData();
  }, [from, to]);

  // Create the table instance
  const table = useReactTable({
    data,
    columns,
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
        setFrom,
        setTo,
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
