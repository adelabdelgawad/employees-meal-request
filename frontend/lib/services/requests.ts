export async function getRequests(fromDate?: string, toDate?: string) {
  try {
    const queryParams = new URLSearchParams();
    if (fromDate) queryParams.append("fromDate", fromDate);
    if (toDate) queryParams.append("toDate", toDate);

    const url = `/api/requests${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      throw new Error("Failed to fetch requests");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching requests:", error);
    return [];
  }
}
