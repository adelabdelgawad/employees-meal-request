"use client";

import * as React from "react";
import { Column, Table } from "@tanstack/react-table";
import { useDataTable } from "../../../app/(pages)/request/requests/DataTableContext";

/**
 * Props for the FilterByInput component.
 * @template TData - The shape of your table rows.
 */
interface FilterByInputProps<TData> {
  column: Column<TData, unknown>;
  table: Table<TData>;
}

/**
 * FilterByInput is a React component that filters rows based on user input.
 * It uses the shared DataTableContext (via useDataTable) to update the column filters.
 * 
 * @template TData - The shape of your table rows.
 * @param {FilterByInputProps<TData>} props - The props for this component.
 * @returns {JSX.Element} A text input that filters the corresponding table column.
 */
export default function FilterByInput<TData>({
  column,
  table,
}: FilterByInputProps<TData>) {
  const { setColumnFilters } = useDataTable();
  const [filterValue, setFilterValue] = React.useState("");

  /**
   * Handle text changes and update local state.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event from the input.
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterValue(e.target.value);
  };

  /**
   * Listen for changes in filterValue and update the global column filters
   * using the DataTableContext’s setColumnFilters.
   */
  React.useEffect(() => {
    setColumnFilters((filters) =>
      filters
        .filter((filter) => filter.id !== column.id)
        .concat(
          filterValue
            ? { id: column.id, value: filterValue }
            : []
        )
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterValue, column.id]);

  /**
   * Reset the input and remove the filter for this column.
   */
  const handleReset = () => {
    setFilterValue("");
  };

  return (
    <div className="flex items-center space-x-2">
      <input
        className="border rounded px-2 py-1"
        type="text"
        value={filterValue}
        onChange={handleChange}
        placeholder={`Filter by ${column.columnDef?.header ?? "Value"}`}
      />
      {filterValue && (
        <button
          onClick={handleReset}
          className="text-red-500 hover:underline"
        >
          Reset
        </button>
      )}
    </div>
  );
}
