import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight } from "lucide-react";

interface SelectionItem {
  id: string;
  name: string;
}

interface SelectionColumnProps {
  type: "employee"; // Only used for employees now
  items: SelectionItem[];
  searchQuery: string;
  searchParamKey: string;
  disabled?: boolean;
}

export default async function SelectionColumn({
  items,
  searchQuery,
  searchParamKey,
  disabled = false,
}: SelectionColumnProps) {
  const filteredItems = items.filter((item) =>
    searchQuery
      ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <div className="space-y-4">
      <form action="/departments-employees" method="GET" className="space-y-2">
        <Input
          type="text"
          name={searchParamKey}
          defaultValue={searchQuery}
          placeholder="Search by code or name"
          className="w-full"
        />
        <div className="flex gap-2">
          <Button
            type="submit"
            name="selectedEmployees"
            value={filteredItems.map((item) => item.id).join(",")}
            variant="outline"
            className="flex-1"
            disabled={disabled || !filteredItems.length}
          >
            Add All
          </Button>
          <Button
            type="submit"
            name="selectedEmployees"
            value=""
            variant="outline"
            className="flex-1"
            disabled={disabled}
          >
            Remove All
          </Button>
        </div>
      </form>
      <ScrollArea className="h-[300px]">
        {filteredItems.length ? (
          filteredItems.map((item) => (
            <form
              key={item.id}
              action="/departments-employees"
              method="GET"
              className="flex items-center justify-between py-2 border-b last:border-b-0"
            >
              <span>{item.name}</span>
              <Button type="submit" variant="ghost" size="sm" disabled={disabled}>
                <input type="hidden" name="selectedEmployees" value={item.id} />
                <ChevronRight className="w-4 h-4" />
              </Button>
            </form>
          ))
        ) : (
          <p className="text-muted-foreground text-center">
            {disabled ? "Select a department first" : "No employees found"}
          </p>
        )}
      </ScrollArea>
    </div>
  );
}