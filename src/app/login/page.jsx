"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/AuthShell";
import GoogleIcon from "@/components/GoogleIcon";
import { FieldError, FormError } from "@/components/Modal";
import { Spinner } from "@/components/Loading";
import { useAuth } from "@/context/AuthContext";
import { humanizeError, authErrorMessage } from "@/lib/errors";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const { user, loading, login, loginWithGoogle } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [loading, user, router]);

  // Google sign-in reports failures by coming back to /login?error=…
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("error");
    if (!code) return;
    // setFormError(authErrorMessage(code));
    window.history.replaceState({}, "", "/login");
  }, []);

  function validate() {
    const next = {};
    if (!email.trim()) next.email = "Email is required.";
    else if (!EMAIL_PATTERN.test(email.trim()))
      next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!validate()) return;
    setBusy("password");
    setFormError(null);
    try {
      const result = await login({ email: email.trim(), password });
      if (result?.error) {
        setFormError(authErrorMessage(result.error));
        return;
      }
      router.replace("/");
    } catch (err) {
      setFormError(
        humanizeError(err, "We couldn't log you in. Please try again."),
      );
    } finally {
      setBusy(null);
    }
  }

  async function handleGoogle() {
    setBusy("google");
    setFormError(null);
    try {
      const result = await loginWithGoogle();
      if (result?.error) {
        setFormError(authErrorMessage(result.error));
        return;
      }
    } catch (err) {
      setFormError(
        humanizeError(err, "Google sign-in failed. Please try again."),
      );
    } finally {
      setBusy(null);
    }
  }

  return (
    <AuthShell note="Your categories and expenses are private to your account.">
      <h1 className="font-display text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.02em]">
        Welcome back
      </h1>
      <p className="mt-2 text-muted">
        Log in to continue tracking your expenses.
      </p>

      <form onSubmit={handleSubmit} noValidate className="neu mt-8 p-6 sm:p-7">
        <label htmlFor="email" className="label-caps block">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="field mt-2"
          placeholder="you@example.com"
          value={email}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
          onChange={(event) => {
            setEmail(event.target.value);
            if (errors.email)
              setErrors((prev) => ({ ...prev, email: undefined }));
          }}
        />
        <FieldError id="email-error">{errors.email}</FieldError>

        <label htmlFor="password" className="label-caps mt-5 block">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className="field mt-2"
          placeholder="••••••••"
          value={password}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "password-error" : undefined}
          onChange={(event) => {
            setPassword(event.target.value);
            if (errors.password)
              setErrors((prev) => ({ ...prev, password: undefined }));
          }}
        />
        <FieldError id="password-error">{errors.password}</FieldError>

        <FormError>{formError}</FormError>

        <button
          type="submit"
          disabled={Boolean(busy)}
          className="key key-primary mt-6 h-12 w-full"
        >
          {busy === "password" ? <Spinner label="Logging in…" /> : "Log In"}
        </button>

        <div className="my-5 flex items-center gap-3">
          <div className="neu-hairline flex-1" />
          <span className="label-caps">or</span>
          <div className="neu-hairline flex-1" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={Boolean(busy)}
          className="key h-12 w-full"
        >
          {busy === "google" ? (
            <Spinner label="Opening Google…" />
          ) : (
            <>
              <GoogleIcon /> Continue with Google
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold text-indigo">
          Create one
        </Link>
      </p>
    </AuthShell>
  );
}
