"use client";

import * as React from "react";
import { Plus, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between border-dotted"
        >
          <Plus className="mr-2 h-4 w-4" />
          {selectedValues.length > 0 ? (
            <>
              {`${column.columnDef?.header} | ${selectedValues.length} selected`}
              <span
                onClick={handleReset}
                className="ml-2 flex items-center gap-1 text-red-500 cursor-pointer"
              >
                <X className="h-4 w-4" /> Reset
              </span>
            </>
          ) : (
            `Filter by ${column.columnDef?.header ?? "Value"}`
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput
            placeholder={`Search ${column.columnDef?.header ?? "Value"}...`}
          />
          <CommandList>
            <CommandEmpty>No values found.</CommandEmpty>
            <CommandGroup>
              {uniqueValues.map(({ value, count }) => (
                <CommandItem
                  key={value}
                  value={value}
                  className="flex items-center"
                >
                  <Checkbox
                    checked={selectedValues.includes(value)}
                    onCheckedChange={() => handleCheckboxChange(value)}
                  />
                  <span className="ml-2">
                    {value} ({count})
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
