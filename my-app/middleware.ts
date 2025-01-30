import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const AUTH_SECRET = process.env.AUTH_SECRET;

// Define role-based access control
const roleBasedAccess = {
  admin: [
    "/",
    "/request/new-request",
    "/request/requests",
    "/report/requests-dashboard",
    "/report/details",
    "/data-management/meal-plans",
    "/setting/users",
    "/security/roles",
  ],
  requester: ["/", "/request/new-request"],
  approver: ["/", "/request/requests"],
  moderator: ["/", "/setting/users", "/security/roles"],
};

// ✅ List of pages that anyone can access
const publicPages = ["/access-denied", "/auth/signin"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ Allow access to public pages immediately
  if (publicPages.includes(pathname)) {
    return NextResponse.next();
  }

  // ✅ Allow static assets, API routes, and Next.js internals
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.endsWith(".png")
  ) {
    return NextResponse.next();
  }

  // 🔒 Enforce authentication first
  const token = await getToken({ req, secret: AUTH_SECRET });

  if (!token) {
    console.warn("No token found - redirecting to login");
    const loginUrl = new URL("/auth/signin", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 🔒 Check if the session is valid
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

  // ✅ Role-based access control
  const session = await auth();
  if (!session?.user) {
    console.warn("No session found - redirecting to login");
    const loginUrl = new URL("/auth/signin", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  const userRoles: (keyof typeof roleBasedAccess)[] =
    session.user.userRoles || [];
  const allowedPaths = userRoles.flatMap(
    (role: keyof typeof roleBasedAccess) => roleBasedAccess[role] || []
  );

  if (!allowedPaths.includes(pathname)) {
    console.warn(`Access denied for user - Redirecting to /access-denied`);
    return NextResponse.redirect(new URL("/access-denied", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
