import { cookies } from "next/headers";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { db, ready } from "./db";

// Building code + nickname + 4-digit pin. The pin only stops a neighbour
// logging sessions under your name; it is hashed and brute-force is throttled.

export const COOKIE = "gym_member";
const YEAR = 60 * 60 * 24 * 365;
const MAX_FAILS = 5;
const LOCK_MIN = 15;

export interface Member { id: string; nickname: string; building_code: string }

export function buildingCodes(): Record<string, string> {
  // BUILDING_CODES="ABC123:our building,XYZ:the other tower" (name optional)
  const out: Record<string, string> = {};
  for (const part of (process.env.BUILDING_CODES ?? "").split(",")) {
    const [code, name] = part.split(":").map((s) => s.trim());
    if (code) out[code.toUpperCase()] = name || code;
  }
  return out;
}

export function hashPin(pin: string): string {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(pin, salt, 32).toString("hex")}`;
}
export function checkPin(pin: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  const got = scryptSync(pin, salt, 32);
  const want = Buffer.from(hash, "hex");
  return got.length === want.length && timingSafeEqual(got, want);
}

export const validNickname = (s: string) => /^[a-z0-9][a-z0-9 _.-]{0,23}$/i.test(s.trim());
export const validPin = (s: string) => /^\d{4}$/.test(s);

/** Join or sign in. Returns the member and a fresh token, or a reason. */
export async function join(codeRaw: string, nicknameRaw: string, pin: string): Promise<{ ok: true; member: Member; token: string } | { ok: false; status: number; error: string }> {
  await ready();
  const code = codeRaw.trim().toUpperCase();
  const nickname = nicknameRaw.trim();
  if (!buildingCodes()[code]) return { ok: false, status: 403, error: "that building code isn't right." };
  if (!validNickname(nickname)) return { ok: false, status: 400, error: "nickname: letters and numbers, up to 24 characters." };
  if (!validPin(pin)) return { ok: false, status: 400, error: "pin: exactly 4 digits." };

  const existing = await db().query<{ id: string; nickname: string; pin_hash: string; failed_pins: number; locked_until: Date | null }>(
    "select id, nickname, pin_hash, failed_pins, locked_until from members where building_code=$1 and lower(nickname)=lower($2)",
    [code, nickname],
  );
  const token = randomBytes(24).toString("base64url");

  if (!existing.rowCount) {
    const r = await db().query<{ id: string }>(
      "insert into members (building_code, nickname, pin_hash, token) values ($1,$2,$3,$4) returning id",
      [code, nickname, hashPin(pin), token],
    );
    return { ok: true, member: { id: r.rows[0].id, nickname, building_code: code }, token };
  }

  const m = existing.rows[0];
  if (m.locked_until && m.locked_until > new Date()) {
    return { ok: false, status: 423, error: `too many tries. that nickname is locked for a few minutes.` };
  }
  if (!checkPin(pin, m.pin_hash)) {
    const fails = m.failed_pins + 1;
    await db().query("update members set failed_pins=$2::int, locked_until=case when $2::int>=$3::int then now() + make_interval(mins => $4::int) else null end where id=$1", [m.id, fails, MAX_FAILS, LOCK_MIN]);
    return { ok: false, status: 401, error: fails >= MAX_FAILS ? "too many tries. locked for 15 minutes." : "that pin doesn't match this nickname." };
  }
  await db().query("update members set failed_pins=0, locked_until=null, token=$2 where id=$1", [m.id, token]);
  return { ok: true, member: { id: m.id, nickname: m.nickname, building_code: code }, token };
}

export async function setSessionCookie(token: string) {
  (await cookies()).set(COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: YEAR });
}
export async function clearSessionCookie() {
  (await cookies()).set(COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
}

export async function currentMember(): Promise<Member | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  await ready();
  const r = await db().query<Member>("select id, nickname, building_code from members where token=$1", [token]);
  return r.rows[0] ?? null;
}
