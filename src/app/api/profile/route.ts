import { NextResponse } from "next/server";
import { currentMember } from "@/lib/auth";
import { db } from "@/lib/db";

const GOALS = new Set(["muscle", "strength", "fatloss", "general", "pilates"]);

export async function PUT(req: Request) {
  const m = await currentMember();
  if (!m) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  let p: { goal?: string; minutes?: number; days?: number; name?: string };
  try { p = await req.json(); } catch { return NextResponse.json({ error: "bad request" }, { status: 400 }); }
  if (!GOALS.has(String(p.goal)) || ![20, 30, 45, 60].includes(Number(p.minutes)) || ![2, 3, 4, 5, 6].includes(Number(p.days))) {
    return NextResponse.json({ error: "invalid profile" }, { status: 400 });
  }
  await db().query(
    `insert into profiles (member_id, goal, minutes, days, name) values ($1,$2,$3,$4,$5)
     on conflict (member_id) do update set goal=excluded.goal, minutes=excluded.minutes, days=excluded.days, name=excluded.name, updated_at=now()`,
    [m.id, p.goal, Number(p.minutes), Number(p.days), String(p.name ?? "").slice(0, 40)],
  );
  return NextResponse.json({ ok: true });
}
