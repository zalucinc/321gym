import { NextResponse } from "next/server";
import { currentMember } from "@/lib/auth";
import { db } from "@/lib/db";

// Everything the client needs to hydrate: profile, history, building week.
export async function GET() {
  const m = await currentMember();
  if (!m) return NextResponse.json({ member: null }, { status: 401 });

  const [profile, sessions, building] = await Promise.all([
    db().query("select goal, minutes, days, name from profiles where member_id=$1", [m.id]),
    db().query("select client_id, date, title, day_index, quick, sets from sessions where member_id=$1 order by date desc limit 500", [m.id]),
    db().query<{ nickname: string; n: string }>(
      `select mem.nickname, count(s.id)::text as n
         from members mem
         left join sessions s on s.member_id = mem.id and s.date >= date_trunc('week', now())
        where mem.building_code = $1
        group by mem.id order by count(s.id) desc, mem.nickname limit 20`,
      [m.building_code],
    ),
  ]);

  return NextResponse.json({
    member: { nickname: m.nickname, building: m.building_code },
    profile: profile.rows[0] ?? null,
    history: sessions.rows.map((r) => ({ id: r.client_id, date: r.date, title: r.title, dayIndex: r.day_index, quick: r.quick, sets: r.sets })),
    building: building.rows.map((r) => ({ nickname: r.nickname, sessions: Number(r.n) })),
  });
}
