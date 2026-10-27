import { NextResponse } from "next/server";
import { currentMember } from "@/lib/auth";
import { db } from "@/lib/db";

// Live building signals, polled by the home screen. Counts only.
export async function GET() {
  const m = await currentMember();
  if (!m) return NextResponse.json({ error: "not signed in" }, { status: 401 });
  const r = await db().query<{ now: string; week: string }>(
    `select
       (select count(*) from members where building_code = $1 and active_until > now())::text as now,
       (select count(distinct s.member_id) from sessions s join members mem on mem.id = s.member_id
         where mem.building_code = $1 and s.date >= date_trunc('week', now()))::text as week`,
    [m.building_code],
  );
  return NextResponse.json({ now: Number(r.rows[0].now), week: Number(r.rows[0].week) }, { headers: { "cache-control": "no-store" } });
}
