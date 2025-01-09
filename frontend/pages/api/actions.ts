"use server";

export async function updateRequestStatus(requestId: number, statusId: number) {
  console.log(requestId);
  try {
    const response = await fetch(
      `http://localhost:8000/update-request-status?request_id=${requestId}&status_id=${statusId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update status: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error updating request status:", error);
    throw error;
  }
}


