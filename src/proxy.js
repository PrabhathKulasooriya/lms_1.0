// src/middleware.js
import NextAuth from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;

  // Maintenance Mode redirect (redirect all sub-routes to home maintenance page)
  if (process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true" && nextUrl.pathname !== "/") {
    return Response.redirect(new URL("/", nextUrl));
  }

  const isLoggedIn = !!req.auth;

  if (!isLoggedIn && nextUrl.pathname.startsWith("/dashboard")) {
    return Response.redirect(new URL("/login", nextUrl));
  }

  if (!isLoggedIn && nextUrl.pathname.startsWith("/learnings")) {
    return Response.redirect(new URL("/login", nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
