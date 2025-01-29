// auth.ts
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { jwtVerify } from "jose"; // Ensure this import is present

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

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
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.userId;
        token.username = user.username;
        token.fullName = user.fullName;
        token.userTitle = user.userTitle;
        token.userRoles = user.userRoles;
        token.accessToken = user.accessToken;
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
  secret: NEXTAUTH_SECRET,
});
