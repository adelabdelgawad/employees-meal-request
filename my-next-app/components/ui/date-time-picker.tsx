"use client"

import * as React from "react"
import { format } from "date-fns"
import { DateRange } from "react-day-picker"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CalendarIcon } from "lucide-react"

interface DatePickerProps {
  mode?: "single" | "range"
  className?: string
  selected?: Date | DateRange
  onSelect?: (date: Date | DateRange | undefined) => void
}

export function DatePicker({
  mode = "single",
  className,
  selected,
  onSelect,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (selection: Date | DateRange | undefined) => {
    if (!selection) return
    
    onSelect?.(selection)
    
    if (mode === "single") {
      setOpen(false)
    } else if (mode === "range" && (selection as DateRange).to) {
      setOpen(false)
    }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !selected && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {mode === "single" ? (
              selected ? (
                format(selected as Date, "MMM dd, yyyy")
              ) : (
                "Pick a date"
              )
            ) : (
              selected && "from" in selected ? (
                selected.to ? (
                  <>
                    {selected.from ? format(selected.from, "MMM dd, yyyy") : "Invalid date"} -{" "}
                    {format(selected.to, "MMM dd, yyyy")}
                  </>
                ) : (
                  selected.from ? format(selected.from, "MMM dd, yyyy") : "Invalid date"
                )
              ) : (
                "Pick a date range"
              )
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode={mode}
            selected={selected}
            onSelect={handleSelect}
            numberOfMonths={mode === "range" ? 2 : 1}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}