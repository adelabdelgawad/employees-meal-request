export const dynamic = "force-dynamic";

// page.tsx
import React from "react";
import { Suspense } from "react";
import TableSkelton from "@/components/Table/table-skelton";
import TableWithSWR from "./TableWithSWR";
import { getMeals } from "@/lib/actions/meal";

async function page() {
  // Extract query parameters

  // Fetch initial data on the server.
  const response: Meal[] | null = await getMeals();

  return (
    <div className="w-full pt-10">
      <div className="flex w-full items-center justify-between"></div>
      <Suspense fallback={<TableSkelton />}>
        <TableWithSWR fallbackData={response} />
      </Suspense>
    </div>
  );
}

export default page;
