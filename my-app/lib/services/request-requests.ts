// app/actions.ts
"use server";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "../session";

const NEXT_PUBLIC_FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL;

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
  const baseUrl = `${NEXT_PUBLIC_FASTAPI_URL}/requests`;

  try {
    const url = new URL(baseUrl);
    const session = await getSession(); // Removed duplicate await
    const userId = session?.user?.userId;
    const isAdmin = !!session?.user?.roles?.includes("Admin");
    if (!userId) {
      throw new Error("User session is invalid or missing user ID");
    }
    // Convert isAdmin boolean to string
    const isAdminString = isAdmin ? "true" : "false";

    // Add query parameters
    url.searchParams.append("query", query);
    url.searchParams.append("page", currentPage.toString());
    url.searchParams.append("page_size", pageSize.toString());
    url.searchParams.append("start_time", startTime);
    url.searchParams.append("end_time", endTime);
    url.searchParams.append("user_id", userId);
    url.searchParams.append("is_admin", isAdminString);


    const response = await fetch(url.toString(), { 
      cache: "no-store",
      headers: {
        // Add authorization header if needed
        Authorization: `Bearer ${session.accessToken}`,
      }
    });

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

    const response = await fetch(
      `${NEXT_PUBLIC_FASTAPI_URL}/update-request-status?request_id=${id}&status_id=${statusId}`,
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

    const updatedRecord = await response.json();
    return res.status(200).json(updatedRecord);
  } catch (error) {
    console.error(`Error updating request status:`, error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export const getRequestLineById = async (id: number) => {
  const res = await fetch(
    `${NEXT_PUBLIC_FASTAPI_URL}/request-lines?request_id=${id}`,
    { cache: "no-store" }
  );

  if (!res.ok) throw new Error("Failed to fetch requests");

  const result = await res.json();
  if (result.length === 0) {
    console.error("No data found.");
    return [];
  }

  return result;
};

export const updateRequestLine = async (
  id: number,
  changedStatus: { id: number; is_accepted: boolean }[]
) => {
  const payload = {
    request_id: id,
    changed_statuses: changedStatus,
  };

  const response = await fetch(`${NEXT_PUBLIC_FASTAPI_URL}/update-request-lines`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to update request lines.");
  }

  const result = await response.json();
  return result.data;
};
