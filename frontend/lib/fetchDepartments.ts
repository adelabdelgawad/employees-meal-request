// /lib/fetchDepartments.ts
export async function fetchDepartments() {
  const res = await fetch("http://localhost:8000/departments", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch departments");
  }

  return res.json();
}
