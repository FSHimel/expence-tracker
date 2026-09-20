/**
 * Human-first errors. Nothing from the database or the auth library is ever
 * shown to the user verbatim — API routes throw these and the browser gets a
 * plain sentence with the right status code.
 */
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.friendly = message;
  }
}

export const GENERIC_MESSAGE = "Something went wrong. Please try again.";

/** Auth.js / NextAuth sign-in result codes → plain sentences. */
const AUTH_MESSAGES = {
  CredentialsSignin: "Incorrect email or password.",
  CallbackRouteError: "Sign-in failed. Please try again.",
  OAuthAccountNotLinked: "This email is already registered. Log in with email and password instead.",
  OAuthSignin: "Google sign-in could not be started. Please try again.",
  OAuthCallback: "Google sign-in was not completed. Please try again.",
  OAuthCreateAccount: "We couldn't create your Google account. Please try again.",
  EmailSignin: "Sign-in link could not be sent. Please try again.",
  AccessDenied: "Access denied.",
  Verification: "That sign-in link has expired.",
  Configuration: "Google sign-in is not configured on this server yet.",
  Default: GENERIC_MESSAGE,
};

export function authErrorMessage(code) {
  return AUTH_MESSAGES[code] || AUTH_MESSAGES.Default;
}

/** Anything thrown on the client (fetch errors, validation errors). */
export function humanizeError(error, fallback = GENERIC_MESSAGE) {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (error.friendly) return error.friendly;
  if (error.name === "HttpError") return error.message;
  return fallback;
}

export function isNetworkError(error) {
  return error?.name === "TypeError";
}
