import axiosInstance from "@/lib/axiosInstance";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const response = await axiosInstance.get("/setting/users");
    console.log("Fetched Users Response:", response.data);

    // Validate that the data contains a 'users' array
    if (!response.data || !Array.isArray(response.data.users)) {
      console.error("Invalid API response for users:", response.data);
      return NextResponse.json({ users: [] });
    }

    return NextResponse.json(response.data.users);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json({ users: [] });
  }
}
