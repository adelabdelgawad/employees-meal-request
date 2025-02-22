import { NextApiRequest, NextApiResponse } from "next";

const NEXT_PUBLIC_FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({
      status: "error",
      message: "Method Not Allowed",
      allowed_methods: ["POST"],
    });
  }

  try {

    let token = req.cookies.session; // Try to get from cookies
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1]; // Try to get from headers
    }

    if (!token) {
      console.error("🚨 No authentication token found!");
      return res.status(401).json({
        status: "error",
        code: "NO_SESSION",
        message: "Authentication required",
      });
    }

    const transformedRequests = req.body.requests.map((item: any) => ({
      employee_id: item.id,
      employee_code: item.code,
      name: item.name,
      department_id: item.department_id,
      meal_id: item.meal_id,
      meal_name: item.meal_name,
      notes: item.notes,
    }));

    const payload = {
      ...req.body,
      requests: transformedRequests,
      request_time: req.body.request_time ? new Date(req.body.request_time).toISOString() : undefined,
    };

    const apiResponse = await fetch(`${NEXT_PUBLIC_FASTAPI_URL}/request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Ensure token is passed
      },
      body: JSON.stringify(payload),
    });

    const contentType = apiResponse.headers.get("content-type");
    const data = contentType?.includes("application/json") ? await apiResponse.json() : await apiResponse.text();

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
    console.error("🚨 Internal Server Error:", error);
    return res.status(500).json({
      status: "error",
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
