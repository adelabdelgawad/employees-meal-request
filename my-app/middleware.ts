import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

// ✅ Define role-based access control mapping
const roleBasedAccess: Record<string, string[]> = {
  Admin: [
    "/",
    "/request/new-request",
    "/request/requests",
    "/report/requests-dashboard",
    "/report/details",
    "/data-management/meal-plans",
    "/setting/users",
    "/security/roles",
  ],
  User: ["/", "/request/new-request"],
  Ordertaker: ["/", "/request/requests"],
  Manager: ["/", "/setting/users", "/security/roles"],
};

// ✅ List of public pages that anyone can access
const publicPages = ["/access-denied", "/auth/signin"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ Allow public pages
  if (publicPages.includes(pathname)) {
    return NextResponse.next();
  }

  // ✅ Allow API calls, static assets, and Next.js internals
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.endsWith(".png")
  ) {
    return NextResponse.next();
  }

  // 🔒 Enforce authentication using `getToken()`
  const token = await getToken({ req, secret: NEXTAUTH_SECRET });

  if (!token) {
    console.warn("No token found - redirecting to login");
    const loginUrl = new URL("/auth/signin", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 🔒 Check if the token has expired
  const now = Math.floor(Date.now() / 1000);
  if (token.exp && token.exp < now) {
    console.warn("Session expired - redirecting to login");
    const loginUrl = new URL("/auth/signin", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ✅ Prevent logged-in users from accessing the login page
  if (pathname === "/auth/signin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // ✅ Extract user roles from token (ensure it's an array)
  const userRoles: string[] = token.userRoles
    ? Array.isArray(token.userRoles)
      ? token.userRoles
      : [token.userRoles]
    : [];

  // ✅ Determine allowed paths based on user roles
  const allowedPaths = userRoles.flatMap((role) => roleBasedAccess[role] || []);

  // 🔒 Restrict access if the user is not authorized
  if (!allowedPaths.includes(pathname)) {
    console.warn(`Access denied for user - Redirecting to /access-denied`);
    return NextResponse.redirect(new URL("/access-denied", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
