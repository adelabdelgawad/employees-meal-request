import * as React from "react";
import { Column } from "@tanstack/react-table";

interface FilterByInputProps<TData> {
  column: Column<TData, unknown>;
}

export default function FilterByInput<TData>({
  column,
}: FilterByInputProps<TData>) {
  if (!column) return null;

  const [filterValue, setFilterValue] = React.useState<string>(
    (column.getFilterValue() as string) || ""
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterValue(e.target.value);
    column.setFilterValue(e.target.value);
  };

  const handleReset = () => {
    setFilterValue("");
    column.setFilterValue(undefined);
  };

  return (
    <div className="flex items-center space-x-2">
      <input
        className="border rounded px-2 py-1"
        type="text"
        value={filterValue}
        onChange={handleChange}
        placeholder={`Filter by ${column.columnDef.header ?? "Value"}...`}
      />
      {filterValue && (
        <button onClick={handleReset} className="text-red-500 hover:underline">
          Reset
        </button>
      )}
    </div>
  );
}
