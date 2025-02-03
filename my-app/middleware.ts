import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { decrypt, getSession } from "./lib/session";

// Ensure the secret is available and consistent with your backend
const SESSION_SECRET = new TextEncoder().encode(process.env.SESSION_SECRET!);

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
const publicPages = ["/access-denied", "/login"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow public pages and static assets (and API routes)
  if (
    publicPages.includes(pathname) ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.endsWith(".png")
  ) {
    return NextResponse.next();
  }

  // 🔒 Get the session token from cookies (raw JWT)
  const sessionToken = request.cookies.get("session")?.value;

  // 1. Check for a valid session token; if missing, redirect to login
  if (!sessionToken) {
    console.warn("No session token found - redirecting to login");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2. Prevent access to the signin page for authenticated users
  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 3. Validate the access token using jose and extract the session payload
  let session = null;

  // Decrypt and retrieve the session
  session = await await getSession();

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 4. Role-based access control: verify that the session has roles
  if (!session || !session?.user.roles) {
    console.warn("No roles found in session - access denied");
    return NextResponse.redirect(new URL("/access-denied", request.url));
  }

  // Normalize roles to an array
  const userRoles: string[] = Array.isArray(session?.user.roles)
    ? session?.user.roles
    : [session?.user.roles];

  // Derive allowed paths for the user based on their roles
  const allowedPaths = userRoles.flatMap((role) => roleBasedAccess[role] || []);

  // If the current pathname is not in the list of allowed paths, deny access
  if (!allowedPaths.includes(pathname)) {
    console.warn(
      `Access denied for ${session.username} - Redirecting to /access-denied`
    );
    return NextResponse.redirect(new URL("/access-denied", request.url));
  }

  // If all checks pass, allow the request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
