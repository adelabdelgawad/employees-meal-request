import NextAuth, { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { jwtVerify } from "jose";

interface User {
  userId: string;
  username: string;
  fullName: string;
  userTitle: string;
  userRoles: string[];
  token: string;
}

// Environment Variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

/**
 * Decodes and verifies a JWT using `jose`
 * @param token The JWT token string
 * @returns Decoded JWT payload
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

declare module "next-auth" {
  interface JWT {
    userId: string;
    username: string;
    fullName: string;
    userTitle: string;
    userRoles: string[];
    accessToken: string;
  }

  interface Session {
    user: {
      userId: string;
      username: string;
      fullName: string;
      userTitle: string;
      userRoles: string[];
    };
    accessToken: string;
  }
}

const authOptions: NextAuthConfig = {
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

          // Decode the JWT
          const decoded = await decodeJWT(data.access_token);
          if (!decoded) throw new Error("Failed to decode token");

          return {
            userId: decoded.userId as string,
            username: decoded.username as string,
            fullName: decoded.fullName as string,
            userTitle: decoded.userTitle as string,
            userRoles: (decoded.userRoles as string[]) || [],
            token: data.access_token,
          } as User;
        } catch (error) {
          console.error("Authentication error:", error);
          throw new Error("Login failed");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const userData = user as User;
        token.userId = userData.userId;
        token.username = userData.username;
        token.fullName = userData.fullName;
        token.userTitle = userData.userTitle;
        token.userRoles = userData.userRoles;
        token.accessToken = userData.token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          userId: token.userId,
          username: token.username,
          fullName: token.fullName,
          userTitle: token.userTitle,
          userRoles: token.userRoles,
        };
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: NEXTAUTH_SECRET,
};

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);
