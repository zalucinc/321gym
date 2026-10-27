"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DAYS, FOCUS, GOALS, MINUTES, generateQuick, generateWeek, type Focus, type Profile, type Session } from "@/lib/generate";
import { store } from "@/lib/store";
import { buildIcs, downloadIcs } from "@/lib/ics";
import { GENERAL_CLAIMS, GOAL_CLAIMS, type Claim } from "@/lib/evidence";
import { computeProgress } from "@/lib/progress";
import { coverImage } from "@/lib/exercises";
import { recommend } from "@/lib/recommend";
import { randomVerse } from "@/lib/fun";
import { sync, type Building, type Me } from "@/lib/sync";

const DEFAULT: Profile = { name: "", goal: "general", minutes: 45, days: 3 };
const WEEKDAYS = ["su", "mo", "tu", "we", "th", "fr", "sa"];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "good morning" : h < 18 ? "good afternoon" : "good evening";
}

export default function Home() {
  const [verse] = useState(() => randomVerse());
  const [profile, setProfile] = useState<Profile>(() => store.getProfile() ?? DEFAULT);
  const [history, setHistory] = useState(() => store.getHistory());
  const [done, setDone] = useState(() => store.getSessionsDone());
  const [showPlan, setShowPlan] = useState(() => store.getProfile() != null);

  const [rec, setRec] = useState(() => recommend(store.getHistory(), store.getLastSets(), store.getProfile() ?? DEFAULT));
  const [nowMinutes, setNowMinutes] = useState<Profile["minutes"]>(30);
  const [nowFocus, setNowFocus] = useState<Focus>(rec.focus);
  const quickSeed = history.filter((h) => h.quick).length;
  const preview = generateQuick(profile.goal, nowMinutes, nowFocus, quickSeed);

  const [me, setMe] = useState<Me | null>(() => sync.getMe());
  const [building, setBuilding] = useState<Building | null>(null);
  useEffect(() => {
    if (!sync.getMe()) return;
    sync.hydrate().then((r) => {
      if (!r) { setMe(null); return; }
      setMe(r.me);
      setBuilding(r.building);
      setProfile(store.getProfile() ?? DEFAULT);
      setHistory(store.getHistory());
      setDone(store.getSessionsDone());
      setShowPlan(store.getProfile() != null);
      // Server history may change today's advice and the default focus.
      const fresh = recommend(store.getHistory(), store.getLastSets(), store.getProfile() ?? DEFAULT);
      setRec(fresh);
      setNowFocus(fresh.focus);
    });
  }, []);

  // Live indicator: refresh every 30 s while the tab is visible, and when it becomes visible again.
  useEffect(() => {
    if (!me) return;
    let stop = false;
    const tick = async () => { const b = await sync.building(); if (!stop && b) setBuilding(b); };
    const id = setInterval(() => { if (document.visibilityState === "visible") void tick(); }, 30_000);
    const onVis = () => { if (document.visibilityState === "visible") void tick(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { stop = true; clearInterval(id); document.removeEventListener("visibilitychange", onVis); };
  }, [me]);

  const [reminderDays, setReminderDays] = useState<number[]>([1, 3, 5]);
  const [reminderTime, setReminderTime] = useState("18:30");
  const [reminderSaved, setReminderSaved] = useState(false);

  const update = (patch: Partial<Profile>) => {
    const next = { ...profile, ...patch };
    setProfile(next);
    store.setProfile(next);
    void sync.pushProfile(next);
  };

  const progress = computeProgress(history);
  const weekSeed = Math.floor(done / profile.days);
  const week = generateWeek(profile, weekSeed);
  const nextDay = done % profile.days;

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-5 pb-24 pt-12">
      <header className="mb-10">
        <p className="eyebrow">321gym</p>
        <h1 className="display mt-2 text-4xl leading-tight">
          {greeting()}
          {profile.name ? `, ${profile.name}` : ""}.
        </h1>
        <p className="display mt-3 text-lg leading-snug text-fg/90">{verse.text}</p>
        <p className="mt-1 text-xs text-muted">— {verse.by}</p>
        <p className="mt-4 text-xs text-muted">
          {me ? (
            <>
              <span className="text-sand">{me.nickname}</span> · building {me.building} ·{" "}
              <button className="underline" onClick={async () => { await sync.signOut(); setMe(null); setBuilding(null); }}>sign out</button>
            </>
          ) : (
            <Link href="/join" className="text-sand underline">join the building</Link>
          )}
          {!me && <span> · keeps your history across phones</span>}
        </p>
      </header>

      {/* ---- for today ---------------------------------------------------- */}
      {rec.notes.length > 0 && (
        <section className="mb-4 rounded-2xl border border-sand/20 bg-surface p-4">
          <span className="label">for today</span>
          <ul className="space-y-2 text-sm leading-relaxed">
            {rec.notes.map((n, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---- right now ---------------------------------------------------- */}
      <section className="card">
        <Hero session={preview} label="right now" />
        <div className="p-4">
          <span className="label">i have</span>
          <Segmented options={MINUTES} value={nowMinutes} onChange={setNowMinutes} suffix=" min" />
          <div className="mt-3 flex flex-wrap gap-1.5">
            {FOCUS.map((f) => (
              <button key={f.id} onClick={() => setNowFocus(f.id)} className={`choice px-3 py-1.5 text-xs ${nowFocus === f.id ? "choice-on" : ""}`}>
                {f.label}
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted">{summary(preview)}</p>
          <Link href={`/workout?now=1&minutes=${nowMinutes}&focus=${nowFocus}&goal=${profile.goal}`} className="btn mt-4 block text-center">
            start now · ~{preview.totalMinutes} min
          </Link>
        </div>
      </section>

      {/* ---- progress ----------------------------------------------------- */}
      {history.length > 0 && (
        <section className="mt-10">
          <span className="label">progress</span>
          <div className="grid grid-cols-3 gap-2">
            <Stat n={progress.total} label={progress.total === 1 ? "session" : "sessions"} />
            <Stat n={progress.thisWeek} label="this week" />
            <Stat n={progress.streakWeeks} label={progress.streakWeeks === 1 ? "week streak" : "week streak"} accent={progress.streakWeeks >= 2} />
          </div>
          {progress.nextMilestone && (
            <p className="mt-3 text-xs text-muted">
              {progress.nextMilestone.left === 1 ? "one more" : `${progress.nextMilestone.left} more`} to {progress.nextMilestone.at}.
            </p>
          )}
          {progress.trends.length > 0 ? (
            <div className="card mt-4 p-4">
              <span className="label">getting stronger</span>
              <ul className="space-y-2.5 text-sm">
                {progress.trends.slice(0, 8).map((t) => (
                  <li key={t.exerciseId} className="flex items-baseline justify-between gap-3">
                    <span className={t.pct > 0 ? "text-fg" : "text-muted"}>{t.name}</span>
                    <span className="shrink-0 font-mono text-xs text-muted">
                      {t.first} → {t.latest}
                      <span className={`ml-2 ${t.pct > 0 ? "text-sand" : ""}`}>{t.pct > 0 ? "+" : ""}{t.pct}%</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted">estimated one-rep max from your logged sets, first session → latest.</p>
            </div>
          ) : (
            <p className="mt-3 text-xs text-muted">log weights on the same exercise twice and your strength trend shows up here.</p>
          )}
        </section>
      )}

      {/* ---- building ----------------------------------------------------- */}
      {me && building && (
        <section className="mt-10">
          <span className="label">the gym right now</span>
          <div className="card flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <span className={`h-2.5 w-2.5 rounded-full ${busyTone(building.now)}`} />
              <span className="display text-xl">
                {building.now > 0 && <span className="text-sand">{building.now} · </span>}
                {busyLabel(building.now)}
              </span>
            </div>
            <span className="text-xs text-muted">
              {building.week === 0 ? "nobody yet this week" : building.week === 1 ? "1 neighbour trained this week" : `${building.week} neighbours trained this week`}
            </span>
          </div>
        </section>
      )}

      {/* ---- weekly plan -------------------------------------------------- */}
      <section className="mt-12">
        <div className="flex items-baseline justify-between">
          <h2 className="display text-2xl">my week</h2>
          {!showPlan && (
            <button className="text-xs text-sand underline" onClick={() => { setShowPlan(true); store.setProfile(profile); }}>
              set up a plan
            </button>
          )}
        </div>

        {showPlan ? (
          <>
            <div className="card mt-4 space-y-6 p-4">
              <div>
                <span className="label">name</span>
                <input className="input" value={profile.name} onChange={(e) => update({ name: e.target.value })} placeholder="optional" />
              </div>
              <div>
                <span className="label">goal</span>
                <div className="grid grid-cols-1 gap-2">
                  {GOALS.map((g) => (
                    <button key={g.id} onClick={() => update({ goal: g.id })} className={`choice flex items-baseline justify-between gap-3 ${profile.goal === g.id ? "choice-on" : ""}`}>
                      <span>{g.label}</span>
                      <span className="text-right text-xs text-muted">{g.blurb}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <span className="label">minutes</span>
                <Segmented options={MINUTES} value={profile.minutes} onChange={(m) => update({ minutes: m })} />
              </div>
              <div>
                <span className="label">days a week</span>
                <Segmented options={DAYS} value={profile.days} onChange={(d) => update({ days: d })} />
              </div>
            </div>

            <ol className="mt-6 space-y-3">
              {week.map((s, i) => (
                <li key={i} className={`card flex ${i === nextDay ? "ring-1 ring-sand/40" : ""}`}>
                  <Thumb session={s} />
                  <div className="flex min-w-0 flex-1 flex-col p-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="eyebrow">day {i + 1}{i === nextDay ? " · up next" : ""}</span>
                      <span className="font-mono text-xs text-muted">~{s.totalMinutes} min</span>
                    </div>
                    <span className="display mt-1 text-xl leading-tight">{s.title}</span>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{summary(s)}</p>
                    {i === nextDay && (
                      <Link href={`/workout?day=${i}`} className="btn mt-3 self-start px-4 py-2 text-xs">
                        start
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-muted">exercises rotate weekly. tap a name mid-workout for how-to, or swap it if the station is taken.</p>

            <details className="mt-6">
              <summary className="cursor-pointer list-none text-xs text-sand underline">why this plan</summary>
              <ul className="card mt-3 divide-y divide-line px-4">
                {[...GOAL_CLAIMS[profile.goal], ...GENERAL_CLAIMS].map((c, i) => (
                  <ClaimRow key={i} claim={c} />
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted">
                <span className="text-fg">strong</span> = position stand or meta-analysis · <span className="text-fg">moderate</span> = pooled evidence, smaller or indirect · <span className="text-fg">convention</span> = common practice, thin evidence
              </p>
            </details>

            <div className="card mt-8 p-4">
              <span className="label">reminders</span>
              <div className="mb-3 flex gap-1.5">
                {WEEKDAYS.map((d, i) => (
                  <button key={d} onClick={() => setReminderDays((ds) => (ds.includes(i) ? ds.filter((x) => x !== i) : [...ds, i].sort()))} className={`choice flex-1 px-0 text-center text-xs ${reminderDays.includes(i) ? "choice-on" : ""}`}>
                    {d}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="time" className="input flex-1" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} />
                <button
                  className="btn-ghost"
                  disabled={!reminderDays.length}
                  onClick={() => {
                    const [h, m] = reminderTime.split(":").map(Number);
                    if (isNativeShell()) {
                      // Inside the iOS app: schedule real notifications instead of a calendar file.
                      window.webkit?.messageHandlers?.reminders?.postMessage({ days: reminderDays, hour: h, minute: m, minutes: profile.minutes });
                      setReminderSaved(true);
                      return;
                    }
                    downloadIcs(buildIcs({ days: reminderDays, hour: h, minute: m, title: "gym", durationMin: profile.minutes }));
                  }}
                >
                  {isNativeShell() ? (reminderSaved ? "saved" : "remind me") : "add to calendar"}
                </button>
              </div>
              <p className="mt-3 text-xs text-muted">
                {isNativeShell() ? "a notification on those days at that time, on this phone." : "a repeating event with a 15-minute alert, in your own calendar app."}
              </p>
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-muted">a goal, days a week, and a schedule that rotates. optional.</p>
        )}
      </section>

      {history.length > 0 && (
        <section className="mt-12">
          <span className="label">history</span>
          <ul className="card divide-y divide-line px-4 text-sm">
            {history.slice(0, 10).map((h, i) => (
              <li key={i} className="flex justify-between py-3 text-muted">
                <span>{h.title}{h.quick ? " · quick" : ""}</span>
                <span className="font-mono text-xs">{new Date(h.date).toLocaleDateString()}</span>
              </li>
            ))}
          </ul>
          <button
            className="mt-4 text-xs text-muted underline"
            onClick={() => {
              if (confirm("delete your profile and history on this device?")) {
                store.reset();
                setProfile(DEFAULT);
                setHistory([]);
                setDone(0);
                setShowPlan(false);
              }
            }}
          >
            reset this device
          </button>
        </section>
      )}
    </main>
  );
}

// The iOS shell injects this flag and exposes a notifications bridge.
declare global {
  interface Window {
    __gym321Native?: boolean;
    webkit?: { messageHandlers?: { reminders?: { postMessage: (m: unknown) => void } } };
  }
}
function isNativeShell() {
  return typeof window !== "undefined" && window.__gym321Native === true;
}

/** Presence buckets from the live count. Counts only, never names. */
function busyLabel(n: number) {
  if (n <= 0) return "empty";
  if (n <= 2) return "barely anyone";
  if (n <= 4) return "getting busier";
  return "busy";
}
function busyTone(n: number) {
  if (n <= 0) return "bg-line";
  if (n <= 2) return "bg-sand/70";
  if (n <= 4) return "bg-accent/80";
  return "bg-accent";
}

function summary(s: Session) {
  const names = s.blocks.filter((b) => b.kind === "main" || b.kind === "flow").map((b) => b.exercise.name);
  const shown = names.slice(0, 6);
  return shown.join(" · ") + (names.length > shown.length ? " · …" : "");
}

/** First photo (or video thumbnail) in the session, for cards. */
function coverUrl(s: Session): string | null {
  for (const b of s.blocks) {
    if (b.kind !== "main" && b.kind !== "flow") continue;
    const url = coverImage(b.exercise);
    if (url) return url;
  }
  return null;
}

function Hero({ session, label }: { session: Session; label: string }) {
  const url = coverUrl(session);
  return (
    <div className="relative h-44 w-full bg-surface-2">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote dataset photo
        <img src={url} alt="" className="h-full w-full object-cover object-top opacity-80" />
      ) : (
        <div className="h-full w-full bg-[radial-gradient(ellipse_at_top_left,_#5a3a2e,_#1d1917_70%)]" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
      <div className="absolute bottom-3 left-4 right-4">
        <span className="eyebrow">{label}</span>
        <div className="display text-2xl leading-tight">{session.title}</div>
      </div>
    </div>
  );
}

function Thumb({ session }: { session: Session }) {
  const url = coverUrl(session);
  return (
    <div className="w-24 shrink-0 bg-surface-2">
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element -- remote dataset photo
        <img src={url} alt="" className="h-full w-full object-cover object-top opacity-80" />
      ) : (
        <div className="h-full w-full bg-[radial-gradient(ellipse_at_top_left,_#5a3a2e,_#1d1917_70%)]" />
      )}
    </div>
  );
}

function Stat({ n, label, accent = false }: { n: number; label: string; accent?: boolean }) {
  return (
    <div className="card px-3 py-4">
      <div className={`display text-3xl tabular-nums ${accent ? "text-sand" : ""}`}>{n}</div>
      <div className="mt-1 text-xs text-muted">{label}</div>
    </div>
  );
}

function ClaimRow({ claim }: { claim: Claim }) {
  return (
    <li className="py-3 text-sm leading-relaxed">
      <p>{claim.text}</p>
      <p className="mt-1 text-xs text-muted">
        <span className={claim.grade === "strong" ? "text-sand" : ""}>{claim.grade}</span>
        {" · "}
        {claim.url ? (
          <a href={claim.url} target="_blank" rel="noreferrer" className="underline">{claim.source}</a>
        ) : (
          claim.source
        )}
      </p>
    </li>
  );
}

function Segmented<T extends number>({ options, value, onChange, suffix = "" }: { options: readonly T[]; value: T; onChange: (v: T) => void; suffix?: string }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}>
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)} className={`choice text-center ${value === o ? "choice-on" : ""}`}>
          {o}{suffix}
        </button>
      ))}
    </div>
  );
}
