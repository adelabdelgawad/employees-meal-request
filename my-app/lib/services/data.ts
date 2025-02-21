const NEXT_PUBLIC_FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL;



export async function getDepartments() {
  const res = await fetch(
    `${NEXT_PUBLIC_FASTAPI_URL}/departments`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch departments");
  }

  return res.json();
}

export async function getEmployees() {
  const res = await fetch(`${NEXT_PUBLIC_FASTAPI_URL}/employees`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch employees");
  }

  return res.json();
}

export async function getMeals() {
  const res = await fetch(`${NEXT_PUBLIC_FASTAPI_URL}/meal-types`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch employees");
}

  return res.json();
}
