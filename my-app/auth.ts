import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const AUTH_SECRET = process.env.AUTH_SECRET;

interface UserSession {
  id: string;
  username: string;
  roles: string[];
  fullName: string;
  title: string;
  email: string;
  accessToken: string;
  refreshToken: string;
}
console.log("AUTH_SECRET", AUTH_SECRET)

async function refreshAccessToken(
  refreshToken: string
): Promise<UserSession | null> {
  try {
    const response = await fetch(`${API_URL}/token/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${refreshToken}`,
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error(`Refresh failed: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      id: data.id,
      username: data.username,
      roles: data.roles,
      fullName: data.fullName,
      title: data.title,
      email: data.email,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
    };
  } catch (error) {
    console.error("Token refresh error:", error);
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

          if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || "Authentication failed");
          }

          const user = await res.json();

          return {
            id: user.id,
            username: user.username,
            roles: user.roles,
            fullName: user.fullName,
            title: user.title,
            email: user.email,
            accessToken: user.accessToken,
            refreshToken: user.refreshToken,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({
      token,
      user,
      account,
    }: {
      token: any;
      user?: UserSession;
      account?: any;
    }) {
      // Initial login
      if (user && account) {
        return {
          ...token,
          ...user,
          expiresAt: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
        };
      }

      // Check if token is still valid
      if (token.expiresAt && Math.floor(Date.now() / 1000) < token.expiresAt) {
        return token;
      }

      // Attempt token refresh
      try {
        const refreshedUser = await refreshAccessToken(
          token.refreshToken as string
        );

        if (!refreshedUser) {
          throw new Error("Failed to refresh token");
        }

        return {
          ...token,
          ...refreshedUser,
          expiresAt: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
        };
      } catch (error) {
        console.error("JWT refresh error:", error);
        await signOut({ redirect: false });
        return {
          ...token,
          error: "RefreshAccessTokenError",
        };
      }
    },
    async session({ session, token }: { session: any; token: any }) {
      session.user = {
        id: token.id as string,
        username: token.username as string,
        roles: token.roles as string[],
        fullName: token.fullName as string,
        title: token.title as string,
        email: token.email as string,
      };
      session.accessToken = token.accessToken as string;
      session.error = token.error as string;
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  secret: AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
  events: {
    async signOut({ token }: { token: any }) {
      try {
        await fetch(`${API_URL}/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token.accessToken}`,
          },
        });
      } catch (error) {
        console.error("Logout error:", error);
      }
    },
  },
});
