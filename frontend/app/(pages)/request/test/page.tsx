// app/(pages)/request/new-request/DepartmentFetcher.tsx

import { DepartmentType } from "@/lib/definitions";

export default async function DepartmentFetcher() {
  // Fetch data from your API
  const res = await fetch("http://localhost:8000/departments", {
    cache: "no-store", // Ensures fresh data
  });

  if (!res.ok) {
    throw new Error("Failed to fetch departments");
  }

  const departments: DepartmentType[] = await res.json();

  // Pass data to the client component
  return <DepartmentList departments={departments} />;
}
