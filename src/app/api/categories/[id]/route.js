import { withUser } from "@/lib/api-route";
import { deleteCategory, getCategory, renameCategory } from "@/lib/data";

export const dynamic = "force-dynamic";

export const GET = withUser(async (_request, { params }, userId) => {
  const { id } = await params;
  const category = await getCategory(userId, id);
  return Response.json({ category });
});

export const PATCH = withUser(async (request, { params }, userId) => {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const category = await renameCategory(userId, id, body.name);
  return Response.json({ category });
});

export const DELETE = withUser(async (_request, { params }, userId) => {
  const { id } = await params;
  await deleteCategory(userId, id);
  return Response.json({ ok: true });
});
