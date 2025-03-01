import toast from "react-hot-toast";
import clientAxiosInstance from "../clientAxiosInstance";

const NEXT_PUBLIC_FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL;

// 1. Fetch roles (returns the roles examples)
export async function fetchRoles(): Promise<Role[]> {
  try {
    const response = await fetch(`${NEXT_PUBLIC_FASTAPI_URL}/roles`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch roles");
    }

    // Parse the response and ensure it matches the Role type
    const data: Role[] = await response.json();

    return data;
  } catch (error) {
    console.error("Error fetching roles:", error);
    return [];
  }
}



// 2. Fetch domain users (returns the users examples)
export async function fetchDomainUsers() {
  try {
    const response = await clientAxiosInstance.get("/domain-users")

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

export async function fetchUsers(userId?: number) {
  try {
    const url = userId
      ? `${NEXT_PUBLIC_FASTAPI_URL}/user?user_id=${userId}`
      : `${NEXT_PUBLIC_FASTAPI_URL}/user`;

    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    const data = await response.json();

    // Handle both array and object responses
    if (userId && Array.isArray(data)) {
      return data[0] ?? null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching users:", error);
    return null;
  }
}

// 3. Submit Add User (logs the created user details)
export async function submitAddUser(
  username: string,
  fullName: string,
  title: string,
  roles: number[]
) {
  try {
    const response = await clientAxiosInstance.post(
      '/user',
      {
        username,
        full_name: fullName,
        title,
        roles,
      }
    );

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
    const response = await fetch(`${NEXT_PUBLIC_FASTAPI_URL}/user/${userId}/roles`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        added_roles: addedRoles,
        removed_roles: removedRoles,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to update user roles");
    }
  } catch (error) {
    console.error("Error updating user roles:", error);
    throw error;
  }
}
