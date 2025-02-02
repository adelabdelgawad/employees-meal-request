"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";

const testUser = {
  id: "1",
  username: "contact@cosdensolutions.io",
  password: "12345678",
};

export async function login(prevState: any, formData: FormData) {
  const username = formData.get("username")?.toString() || "";
  const password = formData.get("password")?.toString() || "";
  const cookieStore = await cookies();

  // Basic validation
  const errors: { [key: string]: string[] } = {};

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  try {
    // Authenticate with FastAPI
    const response = await fetch("http://localhost:8000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: username, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        errors: {
          username: [errorData.detail || "Authentication failed"],
        },
      };
    }

    // Get JWT token from response
    const data = await response.json();
    console.log(data);

    // Set HTTP-only cookie
    cookieStore.set({
      name: "access_token",
      value: data.access_token,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 30, // 30 minutes
      secure: process.env.NODE_ENV === "production",
    });
  } catch (error) {
    return {
      errors: {
        username: ["Failed to connect to authentication service"],
      },
    };
  }

  redirect("/dashboard");
}

export async function logout() {
  const cookieStore = await cookies();

  // Remove JWT cookie
  cookieStore.delete("access_token");
  redirect("/login");
}
