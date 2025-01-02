// api/employee.ts
import { EmployeeType } from "@/lib/definitions";

export async function fetchEmployees(
  selectedDepartments: string[]
): Promise<EmployeeType[]> {
  const params = new URLSearchParams();
  selectedDepartments.forEach((id) => params.append("departments", id));

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/employees?${params.toString()}`,
    {
      cache: "force-cache", // Cache the response
      next: { revalidate: 120 * 60 }, // Revalidate every 2 hours
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch employees: ${response.statusText}`);
  }

  const data: EmployeeType[] = await response.json();
  return data;
}
