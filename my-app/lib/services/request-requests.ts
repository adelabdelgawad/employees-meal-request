// app/actions.ts
"use server";

export interface RequestParams {
  query?: string;
  currentPage?: number;
  pageSize?: number;
  startTime?: string;
  endTime?: string;
}

export interface RequestResponse {
  data: any[]; // Update to a specific type if you know the data structure
  total_pages: number;
  total_rows: number;
}

export async function getRequests({
  query = "",
  currentPage = 1,
  pageSize = 20,
  startTime = "",
  endTime = "",
}: RequestParams = {}): Promise<RequestResponse> {
  const baseUrl = "http://localhost:8000/requests"; // Moved outside the try block

  try {
    const url = new URL(baseUrl);

    // Add query parameters
    url.searchParams.append("query", query);
    url.searchParams.append("page", currentPage.toString());
    url.searchParams.append("page_size", pageSize.toString());
    url.searchParams.append("start_time", startTime);
    url.searchParams.append("end_time", endTime);

    console.log("Fetching data from:", url.toString());

    const response = await fetch(url.toString(), { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(
      `Error fetching data from ${baseUrl} with params: ${JSON.stringify({
        query,
        currentPage,
        pageSize,
        startTime,
        endTime,
      })}`,
      error
    );
    throw error;
  }
}

export async function updateRequestStatus(id: number, statusId: number) {
  {
    try {
      const response = await fetch(
        `http://localhost:8000/update-request-status?request_id=${id}&status_id=${statusId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error(
          `Failed to update statusId request: ${response.statusText}`
        );
      }

      // Update local state
      const updatedRecord = await response.json();
      return updatedRecord;
    } catch (error) {
      console.error(`Error updating request ${id}:`, error);
    }
  }
}
