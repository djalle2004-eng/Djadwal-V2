import { auth } from "@/auth";
import { isAllowedRoute } from "@/lib/rbac";
import { NextResponse } from "next/server";

export default auth((req: any) => {
  const isLoggedIn = !!req.auth;
  const pathname = req.nextUrl.pathname;
  const isDashboardRoute = pathname.startsWith("/dashboard");

  // 1. Redirect unauthenticated users to login
  if (isDashboardRoute && !isLoggedIn) {
    return Response.redirect(new URL("/login", req.nextUrl));
  }

  // 2. Check role-based route access for authenticated users
  if (isDashboardRoute && isLoggedIn) {
    const role = req.auth?.user?.role;

    if (!isAllowedRoute(role, pathname)) {
      // Redirect to dashboard root with a forbidden flag
      const url = new URL("/dashboard", req.nextUrl);
      url.searchParams.set("error", "forbidden");
      return Response.redirect(url);
    }
  }
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
