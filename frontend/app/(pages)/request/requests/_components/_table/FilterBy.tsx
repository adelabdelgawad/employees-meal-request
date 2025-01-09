"use client";

import * as React from "react";
import { Check, PlusCircle } from "lucide-react";
import { Column } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface FilterByProps<TData> {
  column: Column<TData, unknown>;
  uniqueValues: { value: string; count: number }[];
}

export default function FilterBy<TData>({
  column,
  uniqueValues,
}: FilterByProps<TData>) {
  const [open, setOpen] = React.useState(false);
  const filterValue = column.getFilterValue();
  const selectedValues = new Set(Array.isArray(filterValue) ? filterValue : []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircle className="mr-2 size-4" />
          {selectedValues.size > 0 ? (
            <React.Fragment>
              {column.columnDef?.header as React.ReactNode}
              <Badge
                variant="secondary"
                className="ml-2 rounded-sm px-1 font-normal"
              >
                {selectedValues.size}
              </Badge>
            </React.Fragment>
          ) : (
            `Filter by ${column.columnDef?.header ?? "Value"}`
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[12.5rem] p-0" align="start">
        <Command>
          <CommandInput
            placeholder={`Search ${column.columnDef?.header ?? "Value"}...`}
          />
          <CommandList className="max-h-full">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup className="max-h-[18.75rem] overflow-y-auto overflow-x-hidden">
              {uniqueValues.map(({ value, count }) => {
                const isSelected = selectedValues.has(value);

                return (
                  <CommandItem
                    key={value}
                    onSelect={() => {
                      if (isSelected) {
                        selectedValues.delete(value);
                      } else {
                        selectedValues.add(value);
                      }
                      const filterValues = Array.from(selectedValues);
                      column.setFilterValue(
                        filterValues.length ? filterValues : undefined
                      );
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex size-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className="size-4" aria-hidden="true" />
                    </div>
                    <span>{value}</span>
                    <span className="ml-auto flex size-4 items-center justify-center font-mono text-xs">
                      {count}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => column.setFilterValue(undefined)}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
