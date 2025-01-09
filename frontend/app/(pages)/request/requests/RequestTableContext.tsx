import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel, getFilteredRowModel, Table, ColumnFiltersState, RowSelectionState } from "@tanstack/react-table";
import { RequestRecord } from "@/pages/definitions";
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
  mutate: () => Promise<void>;
}

const DataTableContext = createContext<DataTableContextProps | undefined>(
  undefined
);

export const DataTableProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const columns = getColumns();
  const [data, setData] = useState<RequestRecord[]>([]);
  const [from, setFrom] = useState<Date | undefined>(undefined);
  const [to, setTo] = useState<Date | undefined>(undefined);

  // Fetch data function
  const fetchData = async () => {
    try {
      const requests = await getRequests(from, to);
      setData(requests);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    }
  };

  // ✅ Add mutate function
  const mutate = async () => {
    await fetchData();
  };

  // Fetch data on mount and when date range changes
  useEffect(() => {
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
        mutate, // ✅ Expose mutate function
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
