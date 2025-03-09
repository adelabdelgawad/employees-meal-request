// src/middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { routesConfig, publicPaths, AppRole } from "@/config/accessConfig";

export async function middleware(request: NextRequest) {
  const { nextUrl, cookies } = request;
  const pathname = nextUrl.pathname;

  // 1. Allow public paths and static assets
  if (
    publicPaths.includes(pathname) ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.match(/\.(png|jpg|jpeg|gif|ico)$/)
  ) {
    return NextResponse.next();
  }

  // 2. Check for existing session
  const sessionToken = cookies.get("session")?.value;
  
  // Redirect to login if no session token
  if (!sessionToken) {
    return redirectToLogin(request);
  }

  // 3. Prevent authenticated users from accessing login page
  if (pathname === "/login") {
    return redirectToHome(request);
  }

  // 4. Validate session and roles
  const session = await getSession();
  
  // Redirect if no valid session
  if (!session?.user) {
    return redirectToLogin(request);
  }

  // 5. Normalize user roles
  const userRoles = normalizeRoles(session.user.roles);

  // 6. Check route access permissions
  const isAllowed = checkPathAccess(pathname, userRoles);

  // 7. Handle unauthorized access
  if (!isAllowed) {
    console.warn(`Access denied for ${session.user.email} to ${pathname}`);
    return redirectToAccessDenied(request);
  }

  return NextResponse.next();
}

// Helper function to check path access
function checkPathAccess(path: string, userRoles: AppRole[]): boolean {
  // Find matching route configuration
  const routeConfig = routesConfig.find(rc => rc.path === path);

  // Allow access if no specific config exists (public by default)
  if (!routeConfig) return true;

  // Check if user has any required role
  return routeConfig.roles.some(role => userRoles.includes(role));
}

// Helper to normalize roles array
function normalizeRoles(roles: unknown): AppRole[] {
  if (!roles) return [];
  if (Array.isArray(roles)) {
    return roles.filter((r): r is AppRole => 
      typeof r === "string" && isAppRole(r)
    );
  }
  return typeof roles === "string" && isAppRole(roles) ? [roles] : [];
}

// Type guard for AppRole
function isAppRole(role: string): role is AppRole {
  return ["Admin", "User", "Ordertaker", "Manager"].includes(role);
}

// Redirection helpers
const redirectToLogin = (request: NextRequest) => 
  NextResponse.redirect(new URL("/login", request.url));

const redirectToHome = (request: NextRequest) =>
  NextResponse.redirect(new URL("/", request.url));

const redirectToAccessDenied = (request: NextRequest) =>
  NextResponse.redirect(new URL("/access-denied", request.url));

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};