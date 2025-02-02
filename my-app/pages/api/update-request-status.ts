import { NextApiRequest, NextApiResponse } from "next";

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
      `http://localhost:8000/update-request-status?request_id=${id}&status_id=${statusId}`,
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
