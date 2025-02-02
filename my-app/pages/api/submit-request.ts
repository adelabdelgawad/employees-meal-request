// pages/api/submit-request.ts

import type { NextApiRequest, NextApiResponse } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { requests } = req.body;

    if (!requests || !Array.isArray(requests) || requests.length === 0) {
      return res.status(400).json({ message: "No requests provided" });
    }

    // Transform the request keys to match your FastAPI backend requirements
    const transformedRequests = requests.map((request: any) => ({
      employee_id: request.id,
      employee_code: request.code,
      department_id: request.department_id,
      meal_id: request.meal_id,
      notes: request.notes || "",
    }));

    const fastApiResponse = await fetch(`${API_URL}/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transformedRequests),
    });

    const result = await fastApiResponse.json();

    if (!fastApiResponse.ok) {
      return res.status(fastApiResponse.status).json({
        message: "FastAPI request failed",
        fastApiError: result,
      });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error handling requests:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An error occurred while processing the request";
    return res.status(500).json({
      message: errorMessage,
      errorDetails: error,
    });
  }
}
