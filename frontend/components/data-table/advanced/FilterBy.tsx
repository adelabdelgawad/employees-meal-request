"use client";

import * as React from "react";
import { PlusIcon, Cross2Icon } from "@radix-ui/react-icons";
import * as Popover from "@radix-ui/react-popover";
import * as Checkbox from "@radix-ui/react-checkbox";

import { useDataTable } from "../../../app/(pages)/request/requests/DataTableContext";
import { Column, Table } from "@tanstack/react-table";

interface FilterByProps<TData> {
  column: Column<TData, unknown>;
  table: Table<TData>;
}

export default function FilterBy<TData>({
  column,
  table,
}: FilterByProps<TData>) {
  const { setColumnFilters } = useDataTable();
  const [open, setOpen] = React.useState(false);
  const [selectedValues, setSelectedValues] = React.useState<string[]>([]);

  // Dynamically get unique values based on the current filtered dataset
  const uniqueValues = React.useMemo(() => {
    if (!table) return [];

    const valuesMap = table.getFilteredRowModel()?.rows.reduce((acc, row) => {
      const value = String(row.getValue(column.id));
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(valuesMap).map(([value, count]) => ({
      value,
      count,
    }));
  }, [table, column.id]);

  // Handle checkbox selection
  const handleCheckboxChange = (value: string) => {
    setSelectedValues((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  // Apply the filters to the table
  React.useEffect(() => {
    setColumnFilters((filters) =>
      filters
        .filter((filter) => filter.id !== column.id)
        .concat(
          selectedValues.length > 0
            ? { id: column.id, value: selectedValues }
            : []
        )
    );
  }, [selectedValues, column.id, setColumnFilters]);

  // Reset filters
  const handleReset = () => {
    setSelectedValues([]);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button className="flex items-center justify-between w-full px-4 py-2 border border-dotted rounded-md text-sm bg-white hover:bg-gray-100 focus:outline-none">
          <PlusIcon className="mr-2 h-4 w-4" />
          {selectedValues.length > 0 ? (
            <>
              {`${column.columnDef?.header} | ${selectedValues.length} selected`}
              <span
                onClick={handleReset}
                className="ml-2 flex items-center gap-1 text-red-500 cursor-pointer"
              >
                <Cross2Icon className="h-4 w-4" /> Reset
              </span>
            </>
          ) : (
            `Filter by ${column.columnDef?.header ?? "Value"}`
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="w-[200px] p-4 bg-white border rounded-md shadow-md"
          sideOffset={5}
        >
          <input
            type="text"
            placeholder={`Search ${column.columnDef?.header ?? "Value"}...`}
            className="w-full px-3 py-2 mb-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) =>
              setSelectedValues(
                uniqueValues
                  .map((item) => item.value)
                  .filter((value) =>
                    value.toLowerCase().includes(e.target.value.toLowerCase())
                  )
              )
            }
          />
          <div className="flex flex-col gap-2">
            {uniqueValues.map(({ value, count }) => (
              <div key={value} className="flex items-center gap-2">
                <Checkbox.Root
                  className="w-5 h-5 border rounded-md bg-gray-100 flex items-center justify-center"
                  checked={selectedValues.includes(value)}
                  onCheckedChange={() => handleCheckboxChange(value)}
                >
                  <Checkbox.Indicator className="text-blue-500">
                    ✔
                  </Checkbox.Indicator>
                </Checkbox.Root>
                <span>{`${value} (${count})`}</span>
              </div>
            ))}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
