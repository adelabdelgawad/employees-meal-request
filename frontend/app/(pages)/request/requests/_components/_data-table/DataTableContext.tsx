"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  Table,
  PaginationState,
  ColumnFiltersState,
  ColumnDef,
} from "@tanstack/react-table";
import { getRequests } from "@/app/_lib/data-fetcher";

// ✅ Extend the ColumnMeta type inside the module
declare module "@tanstack/react-table" {
  interface ColumnMeta<TData, TValue> {
    filterable?: boolean;
  }
}

interface RequestRecord {
  id: number;
  status_name: string;
  status_id: number;
  requester?: string;
  requester_title?: string;
  meal_type: string;
  request_time: string;
  closed_time?: string;
  notes?: string;
}

interface DataTableContextProps {
  data: RequestRecord[];
  table: Table<RequestRecord>;
  mutate: () => Promise<void>;
}

const DataTableContext = createContext<DataTableContextProps | undefined>(
  undefined
);

export const DataTableProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [data, setData] = useState<RequestRecord[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // ✅ Fetch all data once
  const fetchData = async () => {
    try {
      const requests = await getRequests();
      setData(requests);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, []);

  // ✅ Define columns with filtering
  const columns: ColumnDef<RequestRecord>[] = [
    {
      accessorKey: "requester",
      header: "Requester",
      meta: {
        filterable: true,
      },
    },
    {
      accessorKey: "requester_title",
      header: "Title",
    },
    {
      accessorKey: "request_time",
      header: "Request Time",
    },
    {
      accessorKey: "meal_type",
      header: "Meal Type",
    },
    {
      accessorKey: "status_name",
      header: "Status",
      meta: {
        filterable: true,
      },
    },
    {
      accessorKey: "closed_time",
      header: "Closed Time",
    },
    {
      accessorKey: "notes",
      header: "Notes",
    },
  ];

  // ✅ Create the table instance
  const table = useReactTable({
    data,
    columns,
    state: { pagination, columnFilters },
    onPaginationChange: setPagination,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <DataTableContext.Provider
      value={{
        data,
        table,
        mutate: fetchData,
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
