import { withUser } from "@/lib/api-route";
import { createCategory, listCategories } from "@/lib/data";

export const dynamic = "force-dynamic";

export const GET = withUser(async (_request, _context, userId) => {
  const categories = await listCategories(userId);
  return Response.json({ categories });
});

export const POST = withUser(async (request, _context, userId) => {
  const body = await request.json().catch(() => ({}));
  const category = await createCategory(userId, body.name);
  return Response.json({ category }, { status: 201 });
});
