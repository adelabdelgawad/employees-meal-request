import { NextApiRequest, NextApiResponse } from "next";

const FASTAPI_URL = process.env.FASTAPI_URL || "http://localhost:8000/request";

/**
 * API Route handler that forwards a POST request to FastAPI,
 * transforming each request object to include the required fields.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      status: "error",
      message: "Method Not Allowed",
      allowed_methods: ["POST"],
    });
  }

  try {
    const token = req.cookies.session;
    if (!token) {
      return res.status(401).json({
        status: "error",
        code: "NO_SESSION",
        message: "Authentication required",
      });
    }

    if (!req.body || !req.body.requests) {
      return res.status(400).json({
        status: "error",
        code: "INVALID_REQUEST",
        message: "Missing requests data",
      });
    }

    // Transform each request object to include 'employee_id' and 'employee_code'
    const transformedRequests = req.body.requests.map((item: any) => ({
      employee_id: item.id,
      employee_code: item.code,
      name: item.name,
      department_id: item.department_id,
      meal_id: item.meal_id,
      meal_name: item.meal_name,
      notes: item.notes,
    }));

    const serializedRequestTime = req.body.request_time
      ? new Date(req.body.request_time).toISOString()
      : undefined;

    const payload = {
      ...req.body,
      requests: transformedRequests,
      request_time: serializedRequestTime,
    };
    console.log(payload);

    const apiResponse = await fetch(FASTAPI_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const contentType = apiResponse.headers.get("content-type");
    const data =
      contentType && contentType.includes("application/json")
        ? await apiResponse.json()
        : await apiResponse.text();

    if (!apiResponse.ok) {
      return res.status(apiResponse.status).json({
        status: "error",
        code: "UPSTREAM_ERROR",
        message: "Error from FastAPI",
        details: data,
      });
    }

    return res.status(200).json({
      status: "success",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
