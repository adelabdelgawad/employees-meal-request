export async function getReqeusts() {
  const res = await fetch("http://localhost:8000/requests", {
    cache: "no-store",
  });

  if (!res.ok) {
    console.log(res);
    throw new Error("Failed to fetch requests");
  }

  return res.json();
}
// /lib/fetchDepartments.ts
export async function getDepartments() {
  const res = await fetch("http://localhost:8000/departments", {
    cache: "no-store",
  });

  if (!res.ok) {
    console.log(res);
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

export async function getMealTypes() {
  const res = await fetch("http://localhost:8000/meal-types", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch employees");
  }

  return res.json();
}

export async function getRequests(from?: Date, to?: Date, requestId?: number) {
  // Build query parameters
  const params = new URLSearchParams();

  if (from) params.append("from_date", from.toISOString());
  if (to) params.append("to_date", to.toISOString());
  if (requestId) params.append("request_id", requestId.toString());

  // Fetch requests with date range filter
  const res = await fetch(
    `http://localhost:8000/requests?${params.toString()}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch requests: ${res.statusText}`);
  }

  return res.json();
}

export async function getRequestLines(requestId: number) {
  // Fetch requests with date range filter
  const res = await fetch(
    `http://localhost:8000/request-lines?request_id=${requestId}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch requests");
  }

  return res.json();
}
