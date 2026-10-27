import { NextResponse } from "next/server";
import { currentMember } from "@/lib/auth";
import { db } from "@/lib/db";

interface Incoming { id: string; date: string; title: string; dayIndex: number; quick?: boolean; sets: unknown }

function valid(s: Incoming) {
  return typeof s.id === "string" && s.id.length <= 64 && !Number.isNaN(Date.parse(s.date)) && typeof s.title === "string" && s.title.length <= 80 && Number.isInteger(s.dayIndex) && Array.isArray(s.sets);
}

/** Upsert one or many sessions. Idempotent on (member, client id) so retries are safe. */
export async function POST(req: Request) {
  const m = await currentMember();
  if (!m) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  let body: Incoming | Incoming[];
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad request" }, { status: 400 }); }
  const list = (Array.isArray(body) ? body : [body]).slice(0, 500);
  if (!list.every(valid)) return NextResponse.json({ error: "invalid session" }, { status: 400 });

  for (const s of list) {
    await db().query(
      `insert into sessions (member_id, client_id, date, title, day_index, quick, sets) values ($1,$2,$3,$4,$5,$6,$7)
       on conflict (member_id, client_id) do nothing`,
      [m.id, s.id, new Date(s.date), s.title, s.dayIndex, !!s.quick, JSON.stringify(s.sets).slice(0, 50_000)],
    );
  }
  return NextResponse.json({ ok: true, saved: list.length });
}
