"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";

const AuthContext = createContext(null);

/**
 * Thin wrapper over Auth.js so the rest of the app can keep using
 * user / loading / login / register / loginWithGoogle / logout.
 */
export function AuthProvider({ children }) {
  return (
    <SessionProvider>
      <SessionBridge>{children}</SessionBridge>
    </SessionProvider>
  );
}

function SessionBridge({ children }) {
  const { data: session, status } = useSession();

  const user = useMemo(() => {
    const account = session?.user;
    if (!account) return null;
    return {
      uid: account.id,
      email: account.email || "",
      displayName: account.name || "",
      photoURL: account.image || null,
    };
  }, [session]);

  const register = useCallback(async ({ name, email, password }) => {
  const { registerAccount } = await import("@/lib/api");

  const normalizedEmail = email.trim().toLowerCase();

  // Create account
  await registerAccount({
    name: name.trim(),
    email: normalizedEmail,
    password,
    confirm: password,
  });

  console.log("ACCOUNT CREATED");

  // Automatically sign in
  await signIn("credentials", {
    email: normalizedEmail,
    password,
    redirectTo: "/",
  });

  return true;
}, []);

const login = useCallback(async ({ email, password }) => {
  return signIn("credentials", {
    email: email.trim().toLowerCase(),
    password,
    redirectTo: "/",
  });
}, []);

  const loginWithGoogle = useCallback(async () => {
    // Return straight to the dashboard after Google approves.
    return signIn("google", { callbackUrl: "/" });
  }, []);

  const logout = useCallback(async () => {
    await signOut({ redirect: false });
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile: user
        ? { name: user.displayName, email: user.email, photoURL: user.photoURL }
        : null,
      loading: status === "loading",
      authenticated: status === "authenticated",
      register,
      login,
      loginWithGoogle,
      logout,
    }),
    [user, status, register, login, loginWithGoogle, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
