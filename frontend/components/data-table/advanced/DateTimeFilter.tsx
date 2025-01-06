"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[300px] justify-start text-left font-normal",
            // If "from" is not set, we treat it as empty
            !dateRange?.from && "text-muted-foreground"
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
              // Only "from" is set; show that single date
              format(dateRange.from, "LLL dd, y")
            )
          ) : (
            // If nothing is selected yet
            <span>Pick a date range</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          selected={dateRange}
          onSelect={handleDateRangeChange}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
}
