"use server"

import axiosInstance from "@/lib/axiosInstance";

export async function getRequestLines(requestId: number) {
  // Fetch requests with date range filter

  try {
    const response = await axiosInstance.get(
      `/request-lines?request_id=${requestId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching RequestLines:", error);
    throw new Error("Failed to fetch RequestLines");
  }
}

export async function updateRequestLines(
  requestId: number,
  changedStatuses: ChangedStatus[]
): Promise<string> {
  if (changedStatuses.length === 0) {
    throw new Error("No changes to update.");
  }

  try {
    const response = await axiosInstance.put(
      `/update-request-status?request_id=${requestId}&changed_statuses=${changedStatuses}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching RequestLines:", error);
    throw new Error("Failed to fetch RequestLines");
  }
}

