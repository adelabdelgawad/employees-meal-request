"use client";

import * as React from "react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { CalendarIcon } from "@radix-ui/react-icons";
import * as Popover from "@radix-ui/react-popover";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { ColumnFiltersState } from "@tanstack/react-table";

interface DateTimeFilterProps {
  columnId: string;
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
}

export default function DateTimeFilter({
  columnId,
  setColumnFilters,
}: DateTimeFilterProps) {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: null,
  });

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);

    setColumnFilters((filters) =>
      filters
        .filter((filter) => filter.id !== columnId)
        .concat(
          range?.from && range?.to
            ? {
                id: columnId,
                value: {
                  from: range.from.toISOString(),
                  to: range.to.toISOString(),
                },
              }
            : []
        )
    );
  };

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          className={cn(
            "flex items-center w-[300px] justify-start text-left px-4 py-2 border rounded-md border-gray-300 bg-white text-sm font-normal focus:outline-none focus:ring-2 focus:ring-blue-500",
            !dateRange?.from && "text-gray-500"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, "LLL dd, y")} -{" "}
                {format(dateRange.to, "LLL dd, y")}
              </>
            ) : (
              format(dateRange.from, "LLL dd, y")
            )
          ) : (
            <span>Pick a date range</span>
          )}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="w-auto p-0 bg-white rounded-md shadow-lg border border-gray-200"
          sideOffset={5}
        >
          <Calendar
            initialFocus
            mode="range"
            selected={dateRange}
            onSelect={handleDateRangeChange}
            numberOfMonths={2}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
