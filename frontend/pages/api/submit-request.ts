import { NextApiRequest, NextApiResponse } from "next";

// API Route to handle the submission of requests
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    const { requests } = req.body;

    // Validate that requests exist
    if (!requests || !Array.isArray(requests) || requests.length === 0) {
      return res.status(400).json({ message: "No requests provided" });
    }

    // Log the requests for debugging
    console.log("Received requests:", requests);

    // Send requests to the FastAPI backend
    const fastApiResponse = await fetch(
      "http://localhost:8000/submit-request",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requests),
      }
    );

    if (!fastApiResponse.ok) {
      const errorData = await fastApiResponse.json();
      throw new Error(
        errorData.detail || "Failed to process requests at FastAPI"
      );
    }

    // Parse FastAPI response
    const result = await fastApiResponse.json();
    console.log("FastAPI Response:", result);

    // ✅ Return the created meal request IDs directly from the result
    return res.status(200).json({
      message: "Requests submitted successfully!",
      created_meal_request_ids: result.created_meal_request_ids,
    });
  } catch (error: any) {
    console.error("Error handling requests:", error);
    return res.status(500).json({
      message:
        error.message || "An error occurred while processing the request",
    });
  }
}
