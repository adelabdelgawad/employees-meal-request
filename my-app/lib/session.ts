"use server";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Ensure the SESSION_SECRET environment variable is defined
if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET environment variable is not defined");
}
const secretKey: string = process.env.SESSION_SECRET;
// Encode the secret key once for signing and verifying
const encodedKey = new TextEncoder().encode(secretKey);

/**
 * Type definition for the session payload.
 */
export type SessionPayload = {
  userId: number;
  username: string;
  fullName: string;
  title: string;
  email: string;
  roles: string[];
  exp: string;
};

/**
 * Encrypts (signs) the provided session payload into a JWT token.
 *
 * @param payload - The session payload containing the user ID and expiration timestamp.
 * @returns A Promise that resolves to the signed JWT token.
 */
export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);
}

/**
 * Decrypts and verifies a session JWT token.
 *
 * @param session - The JWT session token to verify.
 * @returns A Promise that resolves to the session payload if verification succeeds,
 *          or undefined if the token is invalid.
 */
export async function decrypt(
  session: string | undefined = ""
): Promise<SessionPayload | undefined> {
  if (!session) {
    console.error("No session token provided for decryption.");
    return undefined;
  }
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ["HS256"],
    });
    // Optionally perform additional type checks here before returning
    return payload as SessionPayload;
  } catch (error) {
    console.error("Failed to verify session", error);
    return undefined;
  }
}

/**
 * Creates a session cookie by signing a JWT token with the provided user ID.
 *
 * @param userId - The ID of the authenticated user.
 * @returns A Promise that resolves to a NextResponse with the session cookie set.
 */
export async function createSession(userId: string): Promise<NextResponse> {
  const cookieStore = await cookies(); // cookies() is synchronous
  const expiresDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  const payload: SessionPayload = {
    userId,
    expiresAt: expiresDate.toISOString(),
  };

  const sessionToken = await encrypt(payload);

  cookieStore.set("session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresDate,
    path: "/",
  });

  // Return a response so that cookie changes are attached to it.
  return NextResponse.next();
}

/**
 * Deletes the session cookie from the client.
 *
 * @returns A Promise that resolves to a NextResponse with the session cookie removed.
 */
export async function deleteSession(): Promise<NextResponse> {
  const cookieStore = await cookies();
  cookieStore.delete("session", { path: "/" });
  return NextResponse.next();
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("access_token")?.value;
  const session = await decrypt(sessionToken);
  return session;
}
