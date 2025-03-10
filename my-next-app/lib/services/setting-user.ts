import toast from "react-hot-toast";
import clientAxiosInstance from "../clientAxiosInstance";

const NEXT_PUBLIC_FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL;

// 2. Fetch domain users (returns the users examples)
export async function fetchDomainUsers() {
  try {
    const response = await clientAxiosInstance.get("/domain-users");

    if (response.status === 200) {
      console.log("Domain users loaded successfully.");
      return await response.data;
    } else {
      toast.error("Failed to get the Domain users the request.");
      return [];
    }
  } catch (error) {
    console.error("Error fetching roles:", error);
    return [];
  }
}

export async function fetchUsers() {
  try {
    const response = await clientAxiosInstance.get(`/user`);
    if (response.status === 200) {
      console.log("Domain users loaded successfully.");
      return await response.data;
    } else {
      toast.error("Failed to get the Domain users the request.");
      return [];
    }
  } catch (error) {
    console.error("Error fetching roles:", error);
    return [];
  }
}

// 3. Submit Add User (logs the created user details)
export async function submitAddUser(
  username: string,
  fullname: string,
  title: string,
  roles: number[]
) {
  try {
    const response = await clientAxiosInstance.post("/user", {
      username,
      fullname: fullname,
      title,
      roles,
    });

    return await response.data;
  } catch (error) {
    console.error("Error fetching roles:", error);
    return [];
  }
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
