"use client";

import * as React from "react";
import {  format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/**
 * The selection mode for the DatePicker.
 */
export type DatePickerMode = "single" | "range";

/**
 * Base props shared between modes.
 */
interface BaseProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /**
   * Selection mode: "single" for a single date, "range" for a date range.
   */
  mode: DatePickerMode;
  /**
   * Optional button width (default is "240px" for single and "300px" for range).
   */
  buttonWidth?: string;
  /**
   * An optional default month to display in the calendar.
   */
  defaultMonth?: Date;
  /**
   * Number of months to show (only used in range mode; default is 2).
   */
  numberOfMonths?: number;
}

/**
 * Props for single date mode.
 */
interface SingleProps extends BaseProps {
  mode: "single";
  /**
   * The currently selected date.
   */
  value?: Date;
  /**
   * Callback invoked when a date is selected.
   */
  onSelect: (value: Date | undefined) => void;
}

/**
 * Props for range mode.
 */
interface RangeProps extends BaseProps {
  mode: "range";
  /**
   * The currently selected date range.
   */
  value?: DateRange;
  /**
   * Callback invoked when a date range is selected.
   */
  onSelect: (value: DateRange | undefined) => void;
}

export type DatePickerProps = SingleProps | RangeProps;

/**
 * A reusable DatePicker component supporting both single date and range selection modes.
 *
 * @param props - Props for the DatePicker.
 */
export function DatePicker({
  mode,
  value,
  onSelect,
  buttonWidth,
  defaultMonth,
  numberOfMonths,
  className,
  ...props
}: DatePickerProps) {
  // Compute the display text for the trigger button.
  const displayText = React.useMemo(() => {
    if (mode === "single") {
      return value ? format(value as Date, "PPP") : "Pick a date";
    }
    if (mode === "range") {
      const range = value as DateRange | undefined;
      if (range?.from) {
        return range.to
          ? `${format(range.from, "LLL dd, y")} - ${format(range.to, "LLL dd, y")}`
          : format(range.from, "LLL dd, y");
      }
      return "Pick a date";
    }
    return "Pick a date";
  }, [mode, value]);

  // Determine default button width if not provided.
  const computedButtonWidth =
    buttonWidth || (mode === "single" ? "240px" : "300px");

  return (
    <div className={cn("grid gap-2", className)} {...props}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              `w-[${computedButtonWidth}] justify-start text-left font-normal`,
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon />
            <span className="ml-2">{displayText}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          {mode === "single" ? (
            <Calendar
              initialFocus
              mode="single"
              defaultMonth={defaultMonth}
              selected={value as Date}
              onSelect={onSelect as (value: Date | undefined) => void}
            />
          ) : (
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={defaultMonth || (value as DateRange)?.from}
              selected={value as DateRange}
              onSelect={onSelect as (value: DateRange | undefined) => void}
              numberOfMonths={numberOfMonths || 2}
            />
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
