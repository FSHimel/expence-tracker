import { withUser } from "@/lib/api-route";
import { addExpense, listExpenses } from "@/lib/data";

export const dynamic = "force-dynamic";

export const GET = withUser(async (_request, { params }, userId) => {
  const { id } = await params;
  const expenses = await listExpenses(userId, id);
  return Response.json({ expenses });
});

export const POST = withUser(async (request, { params }, userId) => {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const expense = await addExpense(userId, id, body);
  return Response.json({ expense }, { status: 201 });
});
