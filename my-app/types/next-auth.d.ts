import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    fullName: string;
    title?: string;
    roles: string[];
    accessToken?: string;
    refreshToken?: string;
  }

  interface Session {
    user: User;
    accessToken?: string;
    error?: string;
  }
}
