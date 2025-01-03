// api/employee.ts
import { EmployeeType } from "@/lib/definitions";

export async function fetchEmployees(): Promise<EmployeeType[]> {
  const res = await fetch("http://localhost:8000/employees", {
    cache: "force-cache", // Enable caching
    next: { revalidate: 120 * 60 }, // Revalidate every 2 hours,
  });

  if (!res.ok) {
    throw new Error("Failed to fetch departments");
  }

  return res.json();
}
