import { HttpError, GENERIC_MESSAGE } from "@/lib/errors";
import { cleanEmail, cleanName, createUser, findUserByEmail } from "@/lib/data";
import bcrypt from "bcryptjs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const name = cleanName(body.name, "Full name");
    const email = cleanEmail(body.email);
    const password = String(body.password || "");
    const confirm = String(body.confirm ?? body.confirmPassword ?? password);

    if (!password) throw new HttpError(400, "Password is required.");
    if (password.length < 6)
      throw new HttpError(400, "Password must be at least 6 characters.");
    if (password.length > 72)
      throw new HttpError(400, "Password must be 72 characters or fewer.");
    if (confirm !== password)
      throw new HttpError(400, "Passwords don't match.");

    const existing = await findUserByEmail(email);
    if (existing) throw new HttpError(409, "This email is already registered.");

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({ name, email, passwordHash });

    return Response.json(
      { ok: true, user: { id: user.id, name: user.name, email: user.email } },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof HttpError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error("[costlog] register", error);
    return Response.json({ error: GENERIC_MESSAGE }, { status: 500 });
  }
}
