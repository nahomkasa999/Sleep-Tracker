import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


const SESSION_COOKIE_NAME = "better-auth.session_token";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const protectedRoutes = ["/", "/dashboard", "/analytics"];
  
  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  if (!sessionCookie) {
    
    const url = request.nextUrl.clone();
    url.pathname = "/register";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/analytics/:path*"],
}; 