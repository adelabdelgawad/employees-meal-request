// lib/services/request-history.ts
"use server";
import { getMeals } from "@/app/actions/meal";

export async function GET() {
  try {
    const response: Meal[] | null = await getMeals();

    console.log(response);
    return response;
  } catch (error: unknown) {
    console.error("Error fetching requests:", error);
    throw new Error("Failed to fetch requests");
  }
}
