import { NextResponse } from "next/server";
import { join, setSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  let body: { code?: string; nickname?: string; pin?: string };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "bad request" }, { status: 400 }); }
  const r = await join(String(body.code ?? ""), String(body.nickname ?? ""), String(body.pin ?? ""));
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.status });
  await setSessionCookie(r.token);
  return NextResponse.json({ member: { nickname: r.member.nickname, building: r.member.building_code } });
}
