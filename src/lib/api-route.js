import { currentUserId } from "@/lib/auth";
import { HttpError, GENERIC_MESSAGE } from "@/lib/errors";

/**
 * Wraps a route handler with the session check and error translation.
 * Every request is verified against the signed-in user before any data is
 * touched — the client is never trusted with an identity.
 */
export function withUser(handler) {
  return async function routeHandler(request, context) {
    try {
      const userId = await currentUserId();
      if (!userId) {
        return Response.json({ error: "Please log in to continue." }, { status: 401 });
      }
      return await handler(request, context, userId);
    } catch (error) {
      if (error instanceof HttpError) {
        return Response.json({ error: error.message }, { status: error.status });
      }
      console.error("[costlog]", error);
      return Response.json({ error: GENERIC_MESSAGE }, { status: 500 });
    }
  };
}
