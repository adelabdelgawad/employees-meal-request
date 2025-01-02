import MealRequestClient from "./MealRequestClient";
import { getDepartments } from "@/utils/api"; // Import getDepartments from the api module

export default async function MealRequestPage() {
  let departmentData;
  try {
    departmentData = await getDepartments();
  } catch (error: any) {
    return <div>Error: {error.message}</div>;
  }

  // Pass department data to the client component
  return <MealRequestClient departmentData={departmentData} />;
}
