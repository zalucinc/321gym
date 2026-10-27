import { NextResponse } from "next/server";
import { currentMember } from "@/lib/auth";
import { db } from "@/lib/db";

// Everything the client needs to hydrate: profile, history, and two anonymous
// building signals — how busy it is right now and how many trained this week.
// Never names: nobody should be able to see who is downstairs.
export async function GET() {
  const m = await currentMember();
  if (!m) return NextResponse.json({ member: null }, { status: 401 });

  const [profile, sessions, building] = await Promise.all([
    db().query("select goal, minutes, days, name from profiles where member_id=$1", [m.id]),
    db().query("select client_id, date, title, day_index, quick, sets from sessions where member_id=$1 order by date desc limit 500", [m.id]),
    db().query<{ now: string; week: string }>(
      `select
         (select count(*) from members where building_code = $1 and active_until > now())::text as now,
         (select count(distinct s.member_id) from sessions s join members mem on mem.id = s.member_id
           where mem.building_code = $1 and s.date >= date_trunc('week', now()))::text as week`,
      [m.building_code],
    ),
  ]);

  return NextResponse.json({
    member: { nickname: m.nickname, building: m.building_code },
    profile: profile.rows[0] ?? null,
    history: sessions.rows.map((r) => ({ id: r.client_id, date: r.date, title: r.title, dayIndex: r.day_index, quick: r.quick, sets: r.sets })),
    building: { now: Number(building.rows[0].now), week: Number(building.rows[0].week) },
  });
}
