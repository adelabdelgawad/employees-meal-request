"use client";

import * as React from "react";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { DateRange as DayPickerDateRange } from "react-day-picker";

// Import shadcn Sheet components
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface DataTableRangePickerProps {
  placeholder?: string;
}

export default function DataTableRangePicker({
  placeholder = "Pick a date",
}: DataTableRangePickerProps) {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathname = usePathname();

  const defaultFrom = searchParams?.get("startDate")
    ? new Date(searchParams.get("startDate")!)
    : undefined;

  const defaultTo = searchParams?.get("endDate")
    ? new Date(searchParams.get("endDate")!)
    : undefined;

  // Controls the Sheet open/close state
  const [open, setOpen] = React.useState(false);

  // Maintain the selected date range
  const [date, setDate] = React.useState<DayPickerDateRange>({
    from: defaultFrom,
    to: defaultTo,
  });

  const handleDateSelect = (newDateRange: DayPickerDateRange | undefined) => {
    // If user picks both from & to, set them
    if (newDateRange?.from && newDateRange?.to) {
      setDate(newDateRange);
    }
    // If user only picks "from"
    else if (newDateRange?.from) {
      setDate({ from: newDateRange.from, to: undefined });
    }
  };

  const handleSaveButtonClick = () => {
    const params = new URLSearchParams(searchParams?.toString() || "");

    // If no date range is selected, clear parameters and close the sheet
    if (!date?.from && !date?.to) {
      params.delete("startDate");
      params.delete("endDate");
      replace(`${pathname}?${params.toString()}`);
      setOpen(false);
      return;
    }

    // Ensure both start and end dates are present
    if (!date?.from) {
      toast.error("Please select a start date.");
      return;
    }
    if (!date?.to) {
      toast.error("Please select an end date.");
      return;
    }

    // Set the parameters if the range is valid
    params.set("startDate", date.from.toISOString().split("T")[0]);
    params.set("endDate", date.to.toISOString().split("T")[0]);
    replace(`${pathname}?${params.toString()}`);
    setOpen(false);
  };

  const handleCancelButtonClick = () => {
    setOpen(false);
  };

  // Helper functions for predefined ranges
  const selectThisMonth = () => {
    const now = new Date();
    setDate({
      from: startOfMonth(now),
      to: new Date(endOfMonth(now).setHours(23, 59, 59, 999)),
    });
  };

  const selectLastMonth = () => {
    const now = new Date();
    const lastMonth = subMonths(now, 1);
    setDate({
      from: new Date(startOfMonth(lastMonth).setHours(0, 0, 0, 0)),
      to: new Date(endOfMonth(lastMonth).setHours(23, 59, 59, 999)),
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* Button that triggers the Sheet */}
      <SheetTrigger asChild>
        <Button size="lg" variant="outline">
          <CalendarIcon className="mx-2 w-5 h-5 opacity-60" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "LLL dd, y")} -{" "}
                {format(date.to, "LLL dd, y")}
              </>
            ) : (
              format(date.from, "LLL dd, y")
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </SheetTrigger>

      {/* Sheet Content */}
      <SheetContent side="right" className="w-full max-w-md p-0">
        {/* Custom Header (top bar) */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Select Date Range</h3>
        </div>

        {/* Main Content */}
        <div className="flex-col">
          <div className="flex gap-4 p-3">
            {/* Left side with quick picks */}
            <div className="space-y-2 pt-4">
              <Button
                className="w-full text-left"
                onClick={() =>
                  handleDateSelect({
                    from: new Date(),
                    to: new Date(),
                  })
                }
              >
                Today
              </Button>
              <Button
                className="w-full text-left"
                onClick={() =>
                  handleDateSelect({
                    from: subMonths(new Date(), 1),
                    to: subMonths(new Date(), 1),
                  })
                }
              >
                Yesterday
              </Button>
              <Button className="w-full text-left" onClick={selectThisMonth}>
                This Month
              </Button>
              <Button className="w-full text-left" onClick={selectLastMonth}>
                Last Month
              </Button>
            </div>

            {/* Right side with the calendar */}
            <div>
              <Calendar
                initialFocus
                mode="range"
                selected={date}
                onSelect={handleDateSelect}
              />
            </div>
          </div>

          {/* Bottom row with Clear, Cancel, and OK */}
          <div className="flex w-full space-x-2 p-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDate({ from: undefined, to: undefined })} // Clears the selection
            >
              Clear
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCancelButtonClick}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSaveButtonClick}>
              OK
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
