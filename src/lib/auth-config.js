/**
 * Edge-safe slice of the Auth.js configuration (used by src/proxy.js).
 * Keep this file free of database imports — it has to run on the edge runtime.
 */
const DEV_FALLBACK_SECRET = "costlog-dev-secret-change-me-in-production-9f2c41";

export const authConfig = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || DEV_FALLBACK_SECRET,
  // The app runs behind a proxy in most deployments; trust the forwarded host
  // so callback URLs are built correctly.
  trustHost: true,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [],
  callbacks: {
    // Every non-public route needs a signed-in user.
    authorized({ auth }) {
      return Boolean(auth?.user);
    },
    // Sign-in/sign-out always land back inside this app: only paths are ever
    // sent to the browser, which also rules out open redirects.
    redirect({ url, baseUrl }) {
      return safeRedirect(url, baseUrl);
    },
  },
};

/**
 * Returns a same-site path for any callback URL. Absolute URLs are dropped
 * unless their origin is explicitly trusted.
 */
export function safeRedirect(url, baseUrl) {
  if (!url) return "/";
  if (url.startsWith("/") && !url.startsWith("//")) return url;

  const trusted = [
    baseUrl,
    process.env.AUTH_URL,
    process.env.NEXTAUTH_URL,
    ...(process.env.AUTH_ALLOWED_ORIGINS || "").split(","),
  ]
    .map((origin) => (origin ? origin.trim().replace(/\/+$/, "") : ""))
    .filter(Boolean);

  try {
    const target = new URL(url);
    if (trusted.includes(target.origin)) {
      return `${target.pathname}${target.search}${target.hash}` || "/";
    }
  } catch {
    /* not a usable URL */
  }
  return "/";
}
