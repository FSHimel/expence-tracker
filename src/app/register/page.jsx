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

export default function RegisterPage() {
  const { user, loading, register, loginWithGoogle } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [loading, user, router]);

  function validate() {
    const next = {};
    if (!name.trim()) next.name = "Full name is required.";
    if (!email.trim()) next.email = "Email is required.";
    else if (!EMAIL_PATTERN.test(email.trim()))
      next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    else if (password.length < 6)
      next.password = "Password must be at least 6 characters.";
    if (!confirm) next.confirm = "Please confirm your password.";
    else if (confirm !== password) next.confirm = "Passwords don't match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleEmailSubmit(event) {
    event.preventDefault();
    if (!validate()) return;
    setBusy("password");
    setFormError(null);
    try {
      await register({ name: name.trim(), email: email.trim(), password });
      router.replace("/");
    } catch (err) {
      console.error("REGISTER ERROR:", err);
      setFormError(err?.message || "Something went wrong.");
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

  function bind(field, value, setter) {
    return {
      value,
      onChange: (event) => {
        setter(event.target.value);
        if (errors[field])
          setErrors((prev) => ({ ...prev, [field]: undefined }));
      },
      "aria-invalid": Boolean(errors[field]),
      "aria-describedby": errors[field] ? `${field}-error` : undefined,
    };
  }

  return (
    <AuthShell note="Passwords are hashed with bcrypt and never leave the server.">
      <h1 className="font-display text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.02em]">
        Create your account
      </h1>
      <p className="mt-2 text-muted">Start keeping track of your expenses.</p>

      <form
        onSubmit={handleEmailSubmit}
        noValidate
        className="neu mt-8 p-6 sm:p-7"
      >
        <label htmlFor="name" className="label-caps block">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          className="field mt-2"
          placeholder="e.g. Rafi Ahmed"
          {...bind("name", name, setName)}
        />
        <FieldError id="name-error">{errors.name}</FieldError>

        <label htmlFor="email" className="label-caps mt-5 block">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="field mt-2"
          placeholder="you@example.com"
          {...bind("email", email, setEmail)}
        />
        <FieldError id="email-error">{errors.email}</FieldError>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="password" className="label-caps block">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className="field mt-2"
              placeholder="At least 6 characters"
              {...bind("password", password, setPassword)}
            />
            <FieldError id="password-error">{errors.password}</FieldError>
          </div>
          <div>
            <label htmlFor="confirm" className="label-caps block">
              Confirm Password
            </label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              className="field mt-2"
              placeholder="Repeat it"
              {...bind("confirm", confirm, setConfirm)}
            />
            <FieldError id="confirm-error">{errors.confirm}</FieldError>
          </div>
        </div>

        <FormError>{formError}</FormError>

        <button
          type="submit"
          disabled={Boolean(busy)}
          className="key key-primary mt-6 h-12 w-full"
        >
          {busy === "password" ? (
            <Spinner label="Creating account…" />
          ) : (
            "Create Account"
          )}
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
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-indigo">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
