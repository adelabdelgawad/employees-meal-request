import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { auth } from "./auth";
import { jwtVerify } from "jose";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

  // Allow public pages and static assets (keep existing logic)
  if (
    publicPages.includes(pathname) ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.endsWith(".png")
  ) {
    return NextResponse.next();
  }

  // 🔒 Get both session and raw JWT
  const sessionToken = await getToken({ req, secret: NEXTAUTH_SECRET });
  const session = await auth();

  // 1. Check for valid session
  if (!session || !sessionToken) {
    console.warn("No session found - redirecting to login");
    const loginUrl = new URL("/auth/signin", req.url);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Prevent access to login page for authenticated users
  if (pathname === "/auth/signin") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // 3. Validate access token using jose
  try {
    const accessToken = sessionToken.accessToken as string;
    const secret = new TextEncoder().encode(NEXTAUTH_SECRET);

    // Verify token signature and decode
    const { payload } = await jwtVerify(accessToken, secret, {
      algorithms: ["HS256"],
    });

    // Check expiration
    const isExpired = (payload.exp || 0) * 1000 < Date.now();

    if (isExpired) {
      console.log("Access token expired - attempting refresh");

      // Attempt to refresh tokens using refresh token from JWT
      const refreshToken = sessionToken.refreshToken as string;
      const refreshResponse = await fetch(`${API_URL}/token/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!refreshResponse.ok) {
        console.error("Refresh token failed - forcing logout");
        const response = NextResponse.redirect(
          new URL("/auth/signin", req.url)
        );
        response.cookies.delete("next-auth.session-token");
        return response;
      }

      // Update session with new tokens
      const newTokens = await refreshResponse.json();
      const response = NextResponse.next();
      response.cookies.set("next-auth.session-token", newTokens.accessToken);
      return response;
    }
  } catch (error) {
    console.error("Token validation failed:", error);
    return NextResponse.redirect(new URL("/auth/signin", req.url));
  }

  // 4. Role-based access control (keep existing logic)
  const userRoles: string[] = Array.isArray(session.user.roles)
    ? session.user.roles
    : [session.user.roles || ""];

  const allowedPaths = userRoles.flatMap((role) => roleBasedAccess[role] || []);

  if (!allowedPaths.includes(pathname)) {
    console.warn(
      `Access denied for ${session.user.username} - Redirecting to /access-denied`
    );
    return NextResponse.redirect(new URL("/access-denied", req.url));
  }

  return NextResponse.next();
}
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
