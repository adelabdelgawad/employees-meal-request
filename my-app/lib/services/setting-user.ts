export interface RequestResponse {
  data: any[]; // Update to a specific type if you know the data structure
  total_pages: number;
  total_rows: number;
}
export interface RequestParams {
  query?: string;
  currentPage?: number;
  pageSize?: number;
  startTime?: string;
  endTime?: string;
}

export async function getUsers({
  query = "",
  currentPage = 1,
  pageSize = 20,
}: RequestParams = {}): Promise<RequestResponse> {
  const baseUrl = "http://localhost:8000/users"; // Moved outside the try block

  try {
    const url = new URL(baseUrl);

    // Add query parameters
    url.searchParams.append("query", query);
    url.searchParams.append("page", currentPage.toString());
    url.searchParams.append("page_size", pageSize.toString());

    console.log("Fetching data from:", url.toString());

    const response = await fetch(url.toString(), { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(
      `Error fetching data from ${baseUrl} with params: ${JSON.stringify({
        query,
        currentPage,
        pageSize,
      })}`,
      error
    );
    throw error;
  }
}

// 1. Fetch roles (returns the roles examples)
export async function fetchRoles(): Promise<Role[]> {
  try {
    const response = await fetch(`http://localhost:8000/roles`, {
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
    const response = await fetch(`http://localhost:8000/domain-users`, {
      cache: "no-store",
    });
    console.log(response);

    if (!response.ok) {
      throw new Error("Failed to fetch roles");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching roles:", error);
    return [];
  }
}

export async function fetchUserById(userId: number) {
  try {
    const url = `http://localhost:8000/user?user_id=${userId}`;
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
  console.log("Submit Add User", username, fullName, title, roles);
  try {
    const fastApiResponse = await fetch("http://localhost:8000/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        full_name: fullName,
        title,
        roles,
      }),
    });

    if (!fastApiResponse.ok) {
      throw new Error("Failed to fetch roles");
    }

    return await fastApiResponse.json();
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
    const response = await fetch(`http://localhost:8000/user/${userId}/roles`, {
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
