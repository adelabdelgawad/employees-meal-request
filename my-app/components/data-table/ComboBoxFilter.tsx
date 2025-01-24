"use client";

import * as React from "react";
import { Check, PlusCircle } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";

interface ComboBoxFilterProps {
  options: { value: string; count: number }[];
  placeholder?: string;
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

const ComboBoxFilter: React.FC<ComboBoxFilterProps> = ({
  options,
  placeholder = "Filter by value...",
  selectedValues,
  onChange,
}) => {
  const [open, setOpen] = React.useState(false);
  const selectedSet = new Set(selectedValues);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircle className="mr-2 h-4 w-4" />
          {selectedSet.size > 0 ? (
            <>
              Filter
              <Badge
                variant="secondary"
                className="ml-2 rounded-sm px-1 font-normal"
              >
                {selectedSet.size}
              </Badge>
            </>
          ) : (
            placeholder
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[12.5rem] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${placeholder}`} />
          <CommandList className="max-h-full">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup className="max-h-[18.75rem] overflow-y-auto overflow-x-hidden">
              {options.map(({ value, count }) => {
                const isSelected = selectedSet.has(value);

                return (
                  <CommandItem
                    key={value}
                    onSelect={() => {
                      if (isSelected) {
                        selectedSet.delete(value);
                      } else {
                        selectedSet.add(value);
                      }
                      onChange(Array.from(selectedSet));
                    }}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          selectedSet.add(value);
                        } else {
                          selectedSet.delete(value);
                        }
                        onChange(Array.from(selectedSet));
                      }}
                      className="mr-2"
                    />
                    <span>{value}</span>
                    <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                      {count}
                    </span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedSet.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => onChange([])}
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
};

export default ComboBoxFilter;
