
"use client";

import useSWR from "swr";
import { TableBody, Column } from "@/components/Table/table-body";
import { getMeals } from "@/app/actions/meal";

interface TableWithSWRProps {
  fallbackData: Meal;
}

export default function TableWithSWR({
  fallbackData,
}: TableWithSWRProps) {
  // Using SWR with a key array and a fetcher function that calls getMeals.
  const { data, error, mutate } = useSWR(
    ["getMeals"],
    () => getMeals(),
    { fallbackData }
  );

  const columns: Column<Meal>[] = [
    { header: "ID", accessor: "id" },
    { header: "NAME", accessor: "name" },
    { header: "ACTIVE", accessor: "is_active" },
  ];

  if (error) return <div>Error loading data...</div>;
  if (!data) return <div>Loading...</div>;

  return (
    <>
      <TableBody<Meal>
        columns={columns}
        data={Array.isArray(data) ? data : []}
        className="shadow-sm"
        // Pass mutate to the Actions component so buttons can update the cache
        options={(_, record: Meal) => {
          // Add your logic here if needed
          return null;
        }}
      />
    </>
  );
}
