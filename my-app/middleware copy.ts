import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { decrypt } from "./lib/session";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const protectedRoutes = ["/"];
  const publicRoutes = ["/login"];

  let session = null;

  // Access cookies on the server
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  // Decrypt and retrieve the session
  session = await decrypt(token);

  // Redirect for protected routes if no valid userId is found
  if (protectedRoutes.includes(path) && !session?.userId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect for public routes if a valid session is detected
  if (publicRoutes.includes(path) && session?.userId) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
