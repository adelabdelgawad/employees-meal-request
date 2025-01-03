"use client";

import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

interface FilterProps<T> {
  items: T[];
  filterBy: (item: T, searchTerm: string) => boolean;
  onFilter: (filteredItems: T[]) => void;
  placeholder?: string;
}

export default function Filter<T>({
  items,
  filterBy,
  onFilter,
  placeholder = "Search...",
}: FilterProps<T>) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!search) {
      onFilter(items);
    } else {
      onFilter(items.filter((item) => filterBy(item, search)));
    }
  }, [search, items]);

  return (
    <Input
      type="text"
      placeholder={placeholder}
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="mb-4"
    />
  );
}
