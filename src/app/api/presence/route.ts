import { NextResponse } from "next/server";
import { currentMember } from "@/lib/auth";
import { db } from "@/lib/db";

// Anonymous presence: "start" marks the member active for 90 minutes,
// "end" clears it. Only the count is ever read back.
export async function POST(req: Request) {
  const m = await currentMember();
  if (!m) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  let body: { state?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad request" }, { status: 400 }); }
  if (body.state === "start") await db().query("update members set active_until = now() + interval '90 minutes' where id=$1", [m.id]);
  else if (body.state === "end") await db().query("update members set active_until = null where id=$1", [m.id]);
  else return NextResponse.json({ error: "state must be start or end" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
