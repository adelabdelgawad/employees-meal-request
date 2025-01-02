// api/department.ts
import { DepartmentType } from "@/lib/definitions";

export async function fetchDepartments(): Promise<DepartmentType[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/departments`,
    {
      cache: "force-cache", // Enable caching
      next: { revalidate: 120 * 60 }, // Revalidate every 2 hours
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch departments: ${response.statusText}`);
  }

  const data: DepartmentType[] = await response.json();
  return data;
}
