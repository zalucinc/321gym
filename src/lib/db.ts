import { Pool } from "pg";

// One pool per process. Schema is created on first use so a fresh Postgres
// (local or Railway) needs no migration step for v1.

declare global {
  var __gymPool: Pool | undefined;
  var __gymSchema: Promise<void> | undefined;
}

export function db(): Pool {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  if (!globalThis.__gymPool) {
    globalThis.__gymPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PGSSL === "1" ? { rejectUnauthorized: false } : undefined, // railway internal network is plain tcp
      max: 5,
    });
  }
  return globalThis.__gymPool;
}

const SCHEMA = `
create table if not exists members (
  id            uuid primary key default gen_random_uuid(),
  building_code text not null,
  nickname      text not null,
  pin_hash      text not null,
  token         text not null unique,
  failed_pins   int  not null default 0,
  locked_until  timestamptz,
  created_at    timestamptz not null default now()
);
create unique index if not exists members_building_nick on members (building_code, lower(nickname));
create table if not exists profiles (
  member_id uuid primary key references members(id) on delete cascade,
  goal      text not null,
  minutes   int  not null,
  days      int  not null,
  name      text not null default '',
  updated_at timestamptz not null default now()
);
create table if not exists sessions (
  id         uuid primary key default gen_random_uuid(),
  member_id  uuid not null references members(id) on delete cascade,
  client_id  text not null,
  date       timestamptz not null,
  title      text not null,
  day_index  int  not null,
  quick      boolean not null default false,
  sets       jsonb not null default '[]',
  created_at timestamptz not null default now(),
  unique (member_id, client_id)
);
create index if not exists sessions_member_date on sessions (member_id, date desc);
alter table members add column if not exists active_until timestamptz;
`;

export function ready(): Promise<void> {
  if (!globalThis.__gymSchema) {
    globalThis.__gymSchema = db()
      .query(SCHEMA)
      .then(() => undefined)
      .catch((e) => { globalThis.__gymSchema = undefined; throw e; });
  }
  return globalThis.__gymSchema;
}
