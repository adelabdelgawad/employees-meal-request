import { ChangedStatus } from "@/pages/definitions";

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

export async function updateRequestLines(
  changedStatuses: ChangedStatus[]
): Promise<string> {
  if (changedStatuses.length === 0) {
    throw new Error("No changes to update.");
  }

  const response = await fetch("http://localhost:8000/update-request-lines", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(changedStatuses),
  });

  if (!response.ok) {
    throw new Error("Failed to save changes.");
  }

  const result = await response.json();
  return result.message;
}
