import { NextApiRequest, NextApiResponse } from "next";

// Mock function to simulate database insertion
const saveRequestsToDatabase = async (requests: any[]) => {
  // Replace this with your actual database logic
  console.log("Saving requests to database:", requests);
  return { success: true, message: "Requests saved successfully." };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { requests } = req.body;

  if (!requests || !Array.isArray(requests) || requests.length === 0) {
    return res.status(400).json({ message: "Invalid request data" });
  }

  try {
    const result = await saveRequestsToDatabase(requests);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Error saving requests:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
