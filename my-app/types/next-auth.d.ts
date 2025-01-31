import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      username: string;
      fullName: string;
      title: string;
      email: string;
      roles: string[];
      accessToken: string;
    };
  }
}
