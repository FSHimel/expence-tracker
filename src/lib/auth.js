import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth-config";
import { findUserByEmail, upsertGoogleUser } from "./data";

/**
 * Auth.js (NextAuth v5) with two providers:
 *   - Email + password (Credentials, hashed with bcrypt)
 *   - Google
 * Sessions are JWTs, so no session documents are readable from the client.
 * The Mongo user id is carried in the token and used to scope every query.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || process.env.AUTH_GOOGLE_ID,
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET || process.env.AUTH_GOOGLE_SECRET,
      // Google verifies email ownership, so an existing email/password account
      // can safely be signed into with Google as well.
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email || "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password || "");
        if (!email || !password) return null;

        const user = await findUserByEmail(email);
        if (!user || !user.passwordHash) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: String(user._id),
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    authorized: authConfig.callbacks.authorized,
    redirect: authConfig.callbacks.redirect,
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === "google") {
          const stored = await upsertGoogleUser({
            email: user.email,
            name: user.name,
            image: user.image,
          });
          token.userId = stored.id;
        } else {
          token.userId = user.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.userId || null;
      return session;
    },
  },
});

export function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

/** Route-handshake helper: 401 unless there is a signed-in user. */
export async function currentUserId() {
  const session = await auth();
  return session?.user?.id || null;
}
