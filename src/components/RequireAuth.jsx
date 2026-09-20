"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { PageLoader } from "./Loading";

/**
 * Client-side route guard. The Firestore security rules are the real
 * boundary; this only keeps the UI honest and sends people to /login.
 * It never redirects while the auth state is still resolving, so there is no
 * redirect loop on first paint.
 */
export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading) return <PageLoader label="Checking your session…" />;
  if (!user) return <PageLoader label="Redirecting to login…" />;
  return children;
}
