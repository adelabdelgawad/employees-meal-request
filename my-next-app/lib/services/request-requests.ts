"use server";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "../session";
import axiosInstance from "../axiosInstance";

export interface RequestParams {
  query?: string;
  currentPage?: number;
  pageSize?: number;
  startTime?: string;
  endTime?: string;
}

export async function getRequests({
  query = "",
  currentPage = 1,
  pageSize = 20,
  startTime = "",
  endTime = "",
}: RequestParams = {}): Promise<RequestsResponse> {
  try {
    const session = await getSession();
    if (!session || !session.user?.id) {
      throw new Error("User session is invalid or missing user ID");
    }

    const { id, roles } = session.user;
    const isAdmin = roles?.includes("Admin") ? "true" : "false";

    // Build the query parameters object.
    const params = {
      query,
      page: currentPage.toString(),
      page_size: pageSize.toString(),
      start_time: startTime,
      end_time: endTime,
      user_id: id.toString(),
      is_admin: isAdmin,
    };

    // Pass the params object to axiosInstance.
    const response = await axiosInstance.get("/requests", { params });
    return response.data;
  } catch (error: unknown) {
    console.error("Error fetching requests:", error);
    throw new Error("Failed to fetch requests");
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { id, statusId } = req.body;
    if (!id || !statusId) {
      return res.status(400).json({ message: "Missing id or statusId" });
    }

    const response = await axiosInstance.put(
      `/update-request-status?request_id=${id}&status_id=${statusId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error Updating request", error);
    throw new Error("Failed to Update request");
  }
}

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
  const payload = {
    request_id: id,
    changed_statuses: changedStatus,
  };

  try {
    const response = await axiosInstance.put(
      `/request-lines?request_id=${id}`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error while updating request lines", error);
    throw new Error("Failed to Update request");
  }
};
