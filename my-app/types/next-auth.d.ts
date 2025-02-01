import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    roles: string[];
    fullName: string;
    title: string;
    email: string;
    accessToken: string;
    refreshToken: string;
  }

  interface Session {
    user: {
      id: string;
      username: string;
      roles: string[];
      fullName: string;
      title: string;
      email: string;
    };
    accessToken: string;
    error?: string;
  }

  interface JWT {
    id: string;
    username: string;
    roles: string[];
    fullName: string;
    title: string;
    email: string;
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    error?: string;
  }
}
