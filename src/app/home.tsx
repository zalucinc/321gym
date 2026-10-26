"use client";

import { useState } from "react";
import Link from "next/link";
import { DAYS, FOCUS, GOALS, MINUTES, generateQuick, generateWeek, type Focus, type Profile } from "@/lib/generate";
import { store } from "@/lib/store";
import { buildIcs, downloadIcs } from "@/lib/ics";
import { GENERAL_CLAIMS, GOAL_CLAIMS, type Claim } from "@/lib/evidence";
import { computeProgress } from "@/lib/progress";

const DEFAULT: Profile = { name: "", goal: "general", minutes: 45, days: 3 };
const WEEKDAYS = ["su", "mo", "tu", "we", "th", "fr", "sa"];

export default function Home() {
  const [profile, setProfile] = useState<Profile>(() => store.getProfile() ?? DEFAULT);
  const [history, setHistory] = useState(() => store.getHistory());
  const [done, setDone] = useState(() => store.getSessionsDone());
  const [showPlan, setShowPlan] = useState(() => store.getProfile() != null);

  // "right now" controls. Defaults borrow from the plan so returning users get one tap.
  const [nowMinutes, setNowMinutes] = useState<Profile["minutes"]>(30);
  const [nowFocus, setNowFocus] = useState<Focus>(profile.goal === "pilates" ? "pilates" : "full");
  const quickSeed = history.filter((h) => h.quick).length;
  const preview = generateQuick(profile.goal, nowMinutes, nowFocus, quickSeed);

  const [reminderDays, setReminderDays] = useState<number[]>([1, 3, 5]);
  const [reminderTime, setReminderTime] = useState("18:30");

  const update = (patch: Partial<Profile>) => {
    const next = { ...profile, ...patch };
    setProfile(next);
    store.setProfile(next);
  };

  const progress = computeProgress(history);
  const weekSeed = Math.floor(done / profile.days);
  const week = generateWeek(profile, weekSeed);
  const nextDay = done % profile.days;

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-5 pb-24 pt-10">
      <header className="mb-10">
        <h1 className="text-2xl font-medium tracking-tight">321gym</h1>
        <p className="mt-1 text-sm text-muted">built from what&apos;s actually downstairs.</p>
      </header>

      {/* ---- right now ---------------------------------------------------- */}
      <section>
        <span className="label">right now · i have</span>
        <Segmented options={MINUTES} value={nowMinutes} onChange={setNowMinutes} suffix=" min" />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {FOCUS.map((f) => (
            <button key={f.id} onClick={() => setNowFocus(f.id)} className={`choice px-3 py-1.5 text-xs ${nowFocus === f.id ? "choice-on" : ""}`}>
              {f.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          {preview.blocks.filter((b) => b.kind === "main" || b.kind === "flow").slice(0, 6).map((b) => b.exercise.name).join(" · ")}
          {preview.blocks.filter((b) => b.kind === "flow").length > 6 ? " · …" : ""}
        </p>
        <Link href={`/workout?now=1&minutes=${nowMinutes}&focus=${nowFocus}&goal=${profile.goal}`} className="btn mt-4 block text-center">
          start now
        </Link>
      </section>

      {/* ---- weekly plan -------------------------------------------------- */}
      <section className="mt-14">
        <div className="flex items-baseline justify-between">
          <span className="label">my week</span>
          {!showPlan && (
            <button className="text-xs text-muted underline" onClick={() => { setShowPlan(true); store.setProfile(profile); }}>
              set up a plan
            </button>
          )}
        </div>

        {showPlan && (
          <>
            <div className="space-y-6">
              <div>
                <span className="label">name</span>
                <input className="input" value={profile.name} onChange={(e) => update({ name: e.target.value })} placeholder="optional" />
              </div>
              <div>
                <span className="label">goal</span>
                <div className="grid grid-cols-1 gap-2">
                  {GOALS.map((g) => (
                    <button key={g.id} onClick={() => update({ goal: g.id })} className={`choice flex items-baseline justify-between ${profile.goal === g.id ? "choice-on" : ""}`}>
                      <span>{g.label}</span>
                      <span className="text-xs text-muted">{g.blurb}</span>
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

            <ol className="mt-8 divide-y divide-line border-y border-line">
              {week.map((s, i) => (
                <li key={i} className="py-4">
                  <div className="flex items-baseline justify-between">
                    <span className={i === nextDay ? "text-fg" : "text-muted"}>
                      {i + 1} · {s.title}
                    </span>
                    <span className="font-mono text-xs text-muted">~{s.totalMinutes} min</span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-muted">{s.blocks.filter((b) => b.kind === "main" || b.kind === "flow").slice(0, 8).map((b) => b.exercise.name).join(" · ")}</p>
                  {i === nextDay && (
                    <Link href={`/workout?day=${i}`} className="btn mt-4 block text-center">
                      start day {i + 1}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-muted">exercises rotate weekly. tap a name mid-workout for how-to, or swap it if the station is taken.</p>

            <details className="mt-8 group">
              <summary className="cursor-pointer list-none text-xs text-muted underline">why this plan</summary>
              <ul className="mt-3 divide-y divide-line border-y border-line">
                {[...GOAL_CLAIMS[profile.goal], ...GENERAL_CLAIMS].map((c, i) => (
                  <ClaimRow key={i} claim={c} />
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted">
                <span className="text-fg">strong</span> = position stand or meta-analysis · <span className="text-fg">moderate</span> = pooled evidence, smaller or indirect · <span className="text-fg">convention</span> = common practice, thin evidence
              </p>
            </details>

            <div className="mt-10">
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
                  className="btn"
                  disabled={!reminderDays.length}
                  onClick={() => {
                    const [h, m] = reminderTime.split(":").map(Number);
                    downloadIcs(buildIcs({ days: reminderDays, hour: h, minute: m, title: "gym", durationMin: profile.minutes }));
                  }}
                >
                  add to calendar
                </button>
              </div>
              <p className="mt-2 text-xs text-muted">a repeating event with a 15-minute alert, in your own calendar app.</p>
            </div>
          </>
        )}
        {!showPlan && <p className="mt-2 text-xs text-muted">a goal, days a week, and a schedule that rotates. optional.</p>}
      </section>

      {history.length > 0 && (
        <section className="mt-14">
          <span className="label">progress</span>
          <div className="grid grid-cols-3 divide-x divide-line border-y border-line">
            <Stat n={progress.total} label={progress.total === 1 ? "session" : "sessions"} />
            <Stat n={progress.thisWeek} label="this week" />
            <Stat n={progress.streakWeeks} label={progress.streakWeeks === 1 ? "week in a row" : "weeks in a row"} />
          </div>
          {progress.nextMilestone && (
            <p className="mt-3 text-xs text-muted">
              {progress.nextMilestone.left === 1 ? "one more" : `${progress.nextMilestone.left} more`} to {progress.nextMilestone.at}.
            </p>
          )}
          {progress.trends.length > 0 && (
            <>
              <span className="label mt-8">getting stronger</span>
              <ul className="divide-y divide-line border-y border-line text-sm">
                {progress.trends.slice(0, 8).map((t) => (
                  <li key={t.exerciseId} className="flex items-baseline justify-between py-2">
                    <span className={t.pct > 0 ? "text-fg" : "text-muted"}>{t.name}</span>
                    <span className="font-mono text-xs text-muted">
                      {t.first} → {t.latest}
                      <span className={`ml-2 ${t.pct > 0 ? "text-fg" : ""}`}>{t.pct > 0 ? "+" : ""}{t.pct}%</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-muted">estimated one-rep max from your logged sets. first session → latest.</p>
            </>
          )}
          {progress.trends.length === 0 && (
            <p className="mt-3 text-xs text-muted">log weights on the same exercise twice and your strength trend shows up here.</p>
          )}
        </section>
      )}

      {history.length > 0 && (
        <section className="mt-12">
          <span className="label">history</span>
          <ul className="divide-y divide-line border-y border-line text-sm">
            {history.slice(0, 10).map((h, i) => (
              <li key={i} className="flex justify-between py-2 text-muted">
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

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="px-3 py-4 first:pl-0 last:pr-0">
      <div className="font-mono text-3xl tabular-nums">{n}</div>
      <div className="mt-1 text-xs text-muted">{label}</div>
    </div>
  );
}

function ClaimRow({ claim }: { claim: Claim }) {
  return (
    <li className="py-3 text-sm leading-relaxed">
      <p>{claim.text}</p>
      <p className="mt-1 text-xs text-muted">
        <span className={claim.grade === "strong" ? "text-fg" : ""}>{claim.grade}</span>
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
