"use server";
import toast from "react-hot-toast";
import { cookies } from "next/headers";
import axiosInstance from "@/lib/axiosInstance";

export async function getRequests(
  query: string = "",
  page: number = 1,
  startDate?: string,
  endDate?: string
): Promise<RequestsResponse> {
  try {
    // Build the query parameters object.
    const params = {
      query,
      page: page.toString(),
      start_time: startDate,
      end_time: endDate,
    };

    // Pass the params object to axiosInstance.
    const response = await axiosInstance.get("/requests", { params });
    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching requests:", error);
    throw new Error("Failed to fetch requests");
  }
}



/**
 * Updates the status of a request by its ID.
 *
 * @param recordId - The ID of the request to update.
 * @param statusId - The new status ID to set for the request.
 * @returns The updated request data.
 * @throws An error if the request fails.
 */
export const updateRequestStatus = async (recordId: number, statusId: number) => {
  console.log(statusId)
  try {
      // Extract the session cookie from the cookie store
      const cookieStore = cookies();
      const sessionCookie = cookieStore.get('session')?.value;

    const response = await axiosInstance.put(
      `/update-request-status?request_id=${recordId}&status_id=${statusId}`, {
        headers: {
          Authorization: sessionCookie ? `Bearer ${sessionCookie}` : '',
        },
      }
    );
    toast.success('Request updated successfully!');
    return response.data;
  } catch (error) {
    console.error('Error updating request:', error);
    toast.error('Failed to update the request. Please try again.');
    throw new Error('Failed to update request');
  }
};

export const getRequestLineById = async (id: number) => {
  try {
    const response = await axiosInstance.get(`/request-lines?request_id=${id}`);
    return response.data;
  } catch (error) {
    console.error("Error Getting Request Line By id", error);
    return [];
  }
};

export const updateRequestLine = async (
  id: number,
  changedStatus: { id: number; is_accepted: boolean }[]
) => {
  // This function must be executed in a server context.
  let sessionCookie = "";
  try {
    const cookieStore = cookies();
    sessionCookie = cookieStore.get("session")?.value || "";
  } catch (error) {
    console.error("Error retrieving session cookie:", error);
    // Optionally, you might want to throw an error here if a session cookie is required.
  }

  const payload = {
    request_id: id,
    changed_statuses: changedStatus,
  };

  try {
    const response = await axiosInstance.put(
      `/request-lines?request_id=${id}`,
      payload,
      {
        headers: {
          Authorization: sessionCookie ? `Bearer ${sessionCookie}` : "",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error while updating request lines", error);
    throw new Error("Failed to update request");
  }
};