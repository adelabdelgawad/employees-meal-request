"use server";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

// Ensure the SESSION_SECRET environment variable is defined
if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is not defined");
}

const secretKey: string = process.env.SESSION_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

export async function decrypt(session: string | undefined = "") {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as Session;
  } catch (error) {
    console.log("Failed to verify session");
  }
}

export async function createSession(user: User) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ user, expiresAt });
  const cookieStore = await cookies();

  cookieStore.set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function updateSession() {
  const session = (await cookies()).get("session")?.value;
  const payload = await decrypt(session);

  if (!session || !payload) {
    return null;
  }

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expires,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

export async function logout() {
  deleteSession();
  redirect("/login");
}
export async function login(prevState: any, formData: FormData) {
  const username = formData.get("username")?.toString() || "";
  const password = formData.get("password")?.toString() || "";

  // Authenticate with FastAPI
  const response = await fetch("http://localhost:8000/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    return {
      errors: {
        username: [errorData.detail || "Authentication failed"],
      },
    };
  }

  // Get user data from response (e.g. FastAPI may return a user object)
  const user = await response.json();

  // Create the session payload with an expiration time.
  await createSession(user);
  redirect("/");
}

export async function getSession(): Promise<Session | null> {
  // Extract the token string from the cookie object.
  const cookie = (await cookies()).get("session")?.value;
  if (!cookie) return null;
  const session = await decrypt(cookie);
  if (!session) return null;
  return session;
}
