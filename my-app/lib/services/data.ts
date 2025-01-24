export async function getDepartments() {
  const res = await fetch("http://localhost:8000/departments", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch departments");
  }

  return res.json();
}

export async function getEmployees() {
  const res = await fetch("http://localhost:8000/employees", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch employees");
  }

  return res.json();
}

export async function getMeals() {
  const res = await fetch("http://localhost:8000/meal-types", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch employees");
np  }

  return res.json();
}
