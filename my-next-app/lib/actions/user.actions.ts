import toast from "react-hot-toast";
import clientAxiosInstance from "@/lib/clientAxiosInstance";
import axiosInstance from "@/lib/axiosInstance";
import { revalidatePath } from "next/cache";

const NEXT_PUBLIC_FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL;

// 2. Fetch domain users (returns the users examples)
export async function getUsers(): Promise<SettingUserResponse> {
  try {
    const response = await axiosInstance.get("/setting/users");
    console.log("Fetched Users Response:", response.data);

    if (!response.data || !Array.isArray(response.data.users)) {
      console.error("Invalid API response for users:", response.data);
      return { users: [] };
    }

    // Ensure roles are correctly parsed
    return response.data;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return { users: [] };
  }
}

interface CreateUserParams {
  username: string;
  fullname: string;
  title: string;
  roles: number[];
}

export async function createUser(userData: CreateUserParams) {
  // Simulate a server delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // In a real app, you would create the user in the database
  console.log("Creating user:", userData);

  const response = await clientAxiosInstance.post("/setting/user", userData);

  return {
    success: true,
    user: response.data,
  };
}

export async function updateUserRoles(
  userId: number,
  addedRoles: number[],
  removedRoles: number[]
): Promise<void> {
  try {
    const response = await fetch(
      `${NEXT_PUBLIC_FASTAPI_URL}/user/${userId}/roles`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          added_roles: addedRoles,
          removed_roles: removedRoles,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update user roles");
    }
  } catch (error) {
    console.error("Error updating user roles:", error);
    throw error;
  }
}
