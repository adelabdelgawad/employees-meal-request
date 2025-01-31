import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { jwtVerify } from "jose";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
const TOKEN_REFRESH_INTERVAL = 5 * 60; // 5 minutes (in seconds)

/**
 * Decodes and verifies a JWT token using `jose`.
 * @param token - JWT access token
 * @returns Decoded JWT payload or null if verification fails.
 */
const decodeJWT = async (token: string) => {
  try {
    const secret = new TextEncoder().encode(NEXTAUTH_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
};

/**
 * Requests a new access token using the refresh token.
 * @param oldToken - The current JWT token object
 * @returns A new token object or null if refresh fails
 */
const refreshAccessToken = async (oldToken: any) => {
  try {
    const response = await fetch(`${API_URL}/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken: oldToken.accessToken }), // Send current access token
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.detail || "Token refresh failed");
    }

    const decoded = await decodeJWT(data.access_token);
    if (!decoded) throw new Error("Failed to decode refreshed token");

    return {
      ...oldToken,
      accessToken: data.access_token,
      expiresAt: Math.floor(Date.now() / 1000) + 30 * 60, // Reset expiration time (30 min)
    };
  } catch (error) {
    console.error("Token refresh error:", error);
    return null; // Force logout on refresh failure
  }
};

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Username and password are required");
        }

        try {
          const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data?.detail || "Invalid credentials");
          }

          const decoded = await decodeJWT(data.access_token);
          if (!decoded) throw new Error("Failed to decode token");

          return {
            userId: decoded.userId as string,
            username: decoded.username as string,
            fullName: decoded.fullName as string,
            userTitle: decoded.userTitle as string,
            userRoles: (decoded.userRoles as string[]) || [],
            accessToken: data.access_token,
            expiresAt: Math.floor(Date.now() / 1000) + 30 * 60, // Set expiration (30 min)
          };
        } catch (error) {
          console.error("Authentication error:", error);
          throw new Error("Login failed");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 60, // 30 minutes (in seconds)
  },
  jwt: {
    maxAge: 30 * 60, // 30 minutes
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          userId: user.userId,
          username: user.username,
          fullName: user.fullName,
          userTitle: user.userTitle,
          userRoles: user.userRoles,
          accessToken: user.accessToken,
          expiresAt: user.expiresAt, // Store expiration time
        };
      }

      // Check if token is close to expiring (within 5 minutes)
      const now = Math.floor(Date.now() / 1000);
      if (token.expiresAt && now >= token.expiresAt - TOKEN_REFRESH_INTERVAL) {
        console.log("Refreshing access token...");
        const refreshedToken = await refreshAccessToken(token);
        if (refreshedToken) return refreshedToken;
        console.warn("Failed to refresh token - forcing logout");
        return {}; // Force logout by clearing token
      }

      return token;
    },

    async session({ session, token }) {
      if (!token.accessToken) {
        return null; // Force logout if token is missing
      }

      session.user = {
        userId: token.userId,
        username: token.username,
        fullName: token.fullName,
        userTitle: token.userTitle,
        userRoles: token.userRoles,
      };
      session.accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: NEXTAUTH_SECRET,
});
