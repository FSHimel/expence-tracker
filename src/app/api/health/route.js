import { getDb, getDatabaseSource } from "@/lib/mongo";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return Response.json({ ok: true, service: "costlog", database: getDatabaseSource() });
  } catch {
    return Response.json({ ok: false, service: "costlog", database: "unreachable" }, { status: 500 });
  }
}
