import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

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
  // Session expiry handling
  const token = await getToken({ req, secret: NEXTAUTH_SECRET });

  if (!token) {
    return NextResponse.next();
  }

  const now = Math.floor(Date.now() / 1000);
  if (token.exp && token.exp < now) {
    console.warn("Session expired - clearing token");
    return NextResponse.redirect("/auth/signin");
  }

  // Role-based access control];
  console.log(token);
  const session = await auth();
  const { pathname } = req.nextUrl;

  // ✅ Allow access to public pages
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

  // 🔄 If the user is not authenticated, redirect to login and save the requested page
  if (!session?.user) {
    if (pathname !== "/auth/signin") {
      const loginUrl = new URL("/auth/signin", req.url);
      loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next(); // Allow access to login page
  }

  // ✅ Prevent logged-in users from accessing the login page
  if (pathname === "/auth/signin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // ✅ Check if the requested page exists in any role's access list
  const allRestrictedPaths = Object.values(roleBasedAccess).flat();
  if (!allRestrictedPaths.includes(pathname)) {
    return NextResponse.next(); // Allow unknown paths (handled by Next.js 404)
  }

  // ✅ Check role-based access
  const userRoles: (keyof typeof roleBasedAccess)[] =
    session.user.userRoles || [];
  const allowedPaths = userRoles.flatMap(
    (role: keyof typeof roleBasedAccess) => roleBasedAccess[role] || []
  );

  // 🚫 If user lacks permission for the requested page, redirect to `/access-denied`
  if (!allowedPaths.includes(pathname)) {
    return NextResponse.redirect(new URL("/access-denied", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
