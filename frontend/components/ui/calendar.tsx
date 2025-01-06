"use client";

import * as React from "react";
import { DayPicker, DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import "react-day-picker/dist/style.css";

interface CalendarProps
  extends Partial<React.ComponentProps<typeof DayPicker>> {
  selected?: DateRange | Date;
}

export function Calendar({ className, ...props }: CalendarProps) {
  return (
    <DayPicker
      {...props}
      className={cn(
        "p-4 border border-gray-300 rounded-md bg-white shadow-sm",
        className
      )}
    />
  );
}
