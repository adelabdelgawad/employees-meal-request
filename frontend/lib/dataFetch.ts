// /lib/fetchDepartments.ts
export async function fetchDepartments() {
  const res = await fetch("http://localhost:8000/departments", {
    cache: "no-store",
  });

  if (!res.ok) {
    console.log(res);
    throw new Error("Failed to fetch departments");
  }

  return res.json();
}

export async function fetchEmployees() {
  const res = await fetch("http://localhost:8000/employees", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch employees");
  }

  return res.json();
}

export async function fetchMealTypes() {
  const res = await fetch("http://localhost:8000/meal-types", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch employees");
  }

  return res.json();
}

export async function fetchRequests() {
  const res = await fetch("http://localhost:8000/requests", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch employees");
  }

  return res.json();
}
