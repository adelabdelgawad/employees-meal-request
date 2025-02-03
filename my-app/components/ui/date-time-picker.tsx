"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DateTimePickerProps {
  /** The currently selected date-time. */
  selectedDateTime: Date | null;
  /** Callback invoked when the date-time changes. */
  onChange: (date: Date | null) => void;
  /** Disables the picker when true. */
  disabled?: boolean;
}

/**
 * A custom date-time picker that uses a popover to show a calendar and a native time input.
 */
export function DateTimePicker({
  selectedDateTime,
  onChange,
  disabled = false,
}: DateTimePickerProps) {
  // Local state for date and time parts.
  const [date, setDate] = React.useState<Date | null>(selectedDateTime);
  const [time, setTime] = React.useState<string>(
    selectedDateTime
      ? format(selectedDateTime, "HH:mm")
      : format(new Date(), "HH:mm")
  );

  // When either the date or time changes, combine them into a new Date.
  React.useEffect(() => {
    if (date && time) {
      const [hours, minutes] = time.split(":").map(Number);
      const updatedDate = new Date(date);
      updatedDate.setHours(hours);
      updatedDate.setMinutes(minutes);
      onChange(updatedDate);
    }
  }, [date, time, onChange]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-[280px] justify-start text-left font-normal"
          disabled={disabled}
        >
          {date ? format(date, "PPP") : "Pick a date"} {time}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <div className="p-4">
          <Calendar
            mode="single"
            selected={date || undefined}
            onSelect={(day) => setDate(day || null)}
            initialFocus
          />
          <div className="mt-4">
            <label
              htmlFor="time"
              className="block text-sm font-medium text-gray-700"
            >
              Time
            </label>
            <Input
              type="time"
              id="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="mt-1 block w-full"
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
