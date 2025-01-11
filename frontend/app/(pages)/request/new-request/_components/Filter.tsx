"use client";

import { useState, useEffect } from "react";
import { Row } from "@tanstack/react-table";

interface FilterProps<T> {
  items: Row<T>[]; // Now filtering rows, not raw data
  filterKey: keyof T;
  onFilter: (filteredItems: Row<T>[]) => void;
  placeholder?: string;
}

export default function Filter<T>({
  items,
  filterKey,
  onFilter,
  placeholder = "Search...",
}: FilterProps<T>) {
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!search) {
      onFilter(items);
    } else {
      onFilter(
        items.filter((row) => {
          const value = row.original[filterKey];
          return (
            typeof value === "string" &&
            value.toLowerCase().includes(search.toLowerCase())
          );
        })
      );
    }
  }, [search, items, filterKey, onFilter]);

  return (
    <div className="mb-4">
      <input
        type="text"
        placeholder={placeholder}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
