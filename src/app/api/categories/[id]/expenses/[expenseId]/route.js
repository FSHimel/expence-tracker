import { withUser } from "@/lib/api-route";
import { deleteExpense, updateExpense } from "@/lib/data";

export const dynamic = "force-dynamic";

export const PATCH = withUser(async (request, { params }, userId) => {
  const { id, expenseId } = await params;
  const body = await request.json().catch(() => ({}));
  const expense = await updateExpense(userId, id, expenseId, body);
  return Response.json({ expense });
});

export const DELETE = withUser(async (_request, { params }, userId) => {
  const { id, expenseId } = await params;
  await deleteExpense(userId, id, expenseId);
  return Response.json({ ok: true });
});
