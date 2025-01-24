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
  requestId: number,
  changedStatuses: ChangedStatus[]
): Promise<string> {
  if (changedStatuses.length === 0) {
    throw new Error("No changes to update.");
  }
  const response = await fetch(
    `http://localhost:8000/update-request-status?request_id=${requestId}&changed_statuses=${changedStatuses}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to save changes.");
  }

  const result = await response.json();
  return result.message;
}
