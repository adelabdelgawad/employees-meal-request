// api/department.ts

import { DepartmentType } from "@/lib/definitions";

export async function fetchDepartments(): Promise<DepartmentType[]> {
  const res = await fetch("http://localhost:8000/departments", {
    cache: "force-cache", // Enable caching
    next: { revalidate: 120 * 60 }, // Revalidate every 2 hours,
  });

  if (!res.ok) {
    throw new Error("Failed to fetch departments");
  }

  return res.json();
}
