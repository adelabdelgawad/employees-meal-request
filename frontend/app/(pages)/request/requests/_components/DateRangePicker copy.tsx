"use client";

import React, { type FC, useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CheckIcon } from "@radix-ui/react-icons";
import { CalendarIcon } from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

export interface DateRangePickerProps {
  setFrom?: (start: Date) => void;
  setTo?: (end: Date | undefined) => void;
  initialDateFrom?: Date | string;
  initialDateTo?: Date | string;
  align?: "start" | "center" | "end";
  locale?: string;
  placeholder?: string;
}

const formatDate = (date: Date, locale: string = "en-us"): string => {
  return date.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getDateAdjustedForTimezone = (dateInput: Date | string): Date => {
  if (typeof dateInput === "string") {
    const parts = dateInput.split("-").map((part) => parseInt(part, 10));
    return new Date(parts[0], parts[1] - 1, parts[2]);
  } else {
    return dateInput;
  }
};

interface DateRange {
  from: Date;
  to: Date | undefined;
}

interface Preset {
  name: string;
  label: string;
}

const PRESETS: Preset[] = [
  { name: "today", label: "Today" },
  { name: "yesterday", label: "Yesterday" },
  { name: "last7", label: "Last 7 days" },
  { name: "last14", label: "Last 14 days" },
  { name: "last30", label: "Last 30 days" },
  { name: "thisWeek", label: "This Week" },
  { name: "lastWeek", label: "Last Week" },
  { name: "thisMonth", label: "This Month" },
  { name: "lastMonth", label: "Last Month" },
];

export const DateRangePicker: FC<DateRangePickerProps> = ({
  setFrom,
  setTo,
  initialDateFrom,
  initialDateTo,
  align = "end",
  locale = "en-US",
  placeholder = "Select a date range", // Default placeholder
}): JSX.Element => {
  const [isOpen, setIsOpen] = useState(false);

  const [range, setRange] = useState<DateRange>({
    from: getDateAdjustedForTimezone(initialDateFrom ?? new Date()),
    to: initialDateTo
      ? getDateAdjustedForTimezone(initialDateTo)
      : initialDateFrom
      ? getDateAdjustedForTimezone(initialDateFrom)
      : undefined,
  });

  const [selectedPreset, setSelectedPreset] = useState<string | undefined>(
    undefined
  );

  const getPresetRange = (presetName: string): DateRange => {
    const preset = PRESETS.find(({ name }) => name === presetName);
    if (!preset) throw new Error(`Unknown date range preset: ${presetName}`);
    const from = new Date();
    const to = new Date();

    switch (preset.name) {
      case "today":
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        break;
      case "yesterday":
        from.setDate(from.getDate() - 1);
        from.setHours(0, 0, 0, 0);
        to.setDate(to.getDate() - 1);
        to.setHours(23, 59, 59, 999);
        break;
      case "last7":
        from.setDate(from.getDate() - 6);
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        break;
      case "last14":
        from.setDate(from.getDate() - 13);
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        break;
      case "last30":
        from.setDate(from.getDate() - 29);
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        break;
      case "thisWeek":
        from.setDate(from.getDate() - from.getDay());
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        break;
      case "lastWeek":
        from.setDate(from.getDate() - 7 - from.getDay());
        to.setDate(to.getDate() - to.getDay() - 1);
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        break;
      case "thisMonth":
        from.setDate(1);
        from.setHours(0, 0, 0, 0);
        to.setHours(23, 59, 59, 999);
        break;
      case "lastMonth":
        from.setMonth(from.getMonth() - 1);
        from.setDate(1);
        from.setHours(0, 0, 0, 0);
        to.setDate(0);
        to.setHours(23, 59, 59, 999);
        break;
    }

    return { from, to };
  };

  const setPreset = (preset: string): void => {
    const range = getPresetRange(preset);
    setRange(range);
    setSelectedPreset(preset);
  };

  const checkPreset = (): void => {
    for (const preset of PRESETS) {
      const presetRange = getPresetRange(preset.name);
      if (
        range.from.getTime() === presetRange.from.getTime() &&
        range.to?.getTime() === presetRange.to?.getTime()
      ) {
        setSelectedPreset(preset.name);
        return;
      }
    }
    setSelectedPreset(undefined);
  };

  useEffect(() => {
    checkPreset();
  }, [range]);

  return (
    <Popover
      modal={true}
      open={isOpen}
      onOpenChange={(open: boolean) => setIsOpen(open)}
    >
      <PopoverTrigger asChild>
        <Button size="lg" variant="outline">
          <div className="flex items-center justify-between">
            <CalendarIcon className="mx-2 w-5 h-5 opacity-60" />
            <div className="text-right">
              {range.from && range.to
                ? `${formatDate(range.from, locale)} - ${formatDate(
                    range.to,
                    locale
                  )}`
                : placeholder}
            </div>
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent align={align} className="w-auto">
        <div className="flex">
          {/* Presets on the left side */}
          <div className="flex flex-col pr-4 border-r">
            {PRESETS.map((preset) => (
              <Button
                key={preset.name}
                onClick={() => setPreset(preset.name)}
                className={cn(
                  "justify-start",
                  selectedPreset === preset.name && "pointer-events-none"
                )}
                variant="ghost"
              >
                {selectedPreset === preset.name && (
                  <CheckIcon className="mr-2 opacity-70" />
                )}
                {preset.label}
              </Button>
            ))}
          </div>
          {/* Calendar on the right side */}
          <div>
            <Calendar
              mode="range"
              selected={range}
              onSelect={(value: { from?: Date; to?: Date }) => {
                if (value.from) {
                  setRange({ from: value.from, to: value.to });
                  setSelectedPreset(undefined); // Clear the preset if manually adjusted
                }
              }}
              numberOfMonths={2}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 p-4">
          <Button onClick={() => setIsOpen(false)} variant="ghost">
            Cancel
          </Button>
          <Button
            onClick={() => {
              setIsOpen(false);
              if (range) {
                setFrom?.(range.from);
                setTo?.(range.to);
              }
            }}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
