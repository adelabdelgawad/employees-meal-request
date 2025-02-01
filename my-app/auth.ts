import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { jwtVerify } from "jose";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

async function refreshAccessToken(refreshToken: string) {
  try {
    const response = await fetch(`${API_URL}/token/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) throw new Error("Refresh failed");
    return await response.json();
  } catch (error) {
    return null;
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: credentials?.username,
              password: credentials?.password,
            }),
          });

          if (!res.ok) return null;
          return await res.json();
        } catch (error) {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Initial login
      if (user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          user: {
            id: user.id,
            username: user.username,
            roles: user.roles,
            fullName: user.fullName,
            title: user.title,
            email: user.email,
          },
        };
      }

      // Token validation and refresh logic
      if (token.accessToken) {
        try {
          const secret = new TextEncoder().encode(NEXTAUTH_SECRET);
          const { payload } = await jwtVerify(
            token.accessToken as string,
            secret,
            { algorithms: ["HS256"] }
          );

          // Check expiration manually (jwtVerify would throw if expired)
          const isExpired = (payload.exp || 0) * 1000 < Date.now();
          if (!isExpired) return token;
        } catch (error) {
          console.log("Token validation error:", error);
        }

        // Attempt refresh if validation fails
        const refreshed = await refreshAccessToken(
          token.refreshToken as string
        );
        if (!refreshed) {
          await signOut();
          return { ...token, error: "RefreshAccessTokenError" };
        }

        return {
          ...token,
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken,
        };
      }

      return token;
    },
    async session({ session, token }) {
      session.user = token.user as any;
      session.accessToken = token.accessToken as string;
      session.error = token.error as string;
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
});
