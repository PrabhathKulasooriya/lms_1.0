// src/middleware.js
import NextAuth from "next-auth";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;

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
