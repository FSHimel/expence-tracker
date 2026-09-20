import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth-config";

/**
 * Route protection (Next.js "proxy" — the renamed middleware convention).
 * Everything except the auth pages, the API and static assets requires a
 * session; unauthenticated visitors are sent to /login.
 *
 * The real boundary stays in the API routes, which scope every query by the
 * user id carried in the session — this only keeps the UI honest.
 */
const { auth } = NextAuth(authConfig);

const proxy = auth;

export default proxy;
export { proxy };

export const config = {
  matcher: ["/((?!api|login|register|_next/static|_next/image|images|favicon.ico|.*\\.png$).*)"],
};
