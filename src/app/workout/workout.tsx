"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { generateQuick, generateSession, type Block, type Focus, type Goal, type Profile } from "@/lib/generate";
import { newId, store, suggestLoad, type HistoryEntry, type SetLog } from "@/lib/store";
import { sync } from "@/lib/sync";
import { restLine } from "@/lib/fun";
import { mediaFrames, videoEmbedUrl, youtubeSearchUrl, type Exercise } from "@/lib/exercises";
import { equipmentById } from "@/lib/equipment";

export default function Workout() {
  const params = useSearchParams();
  const router = useRouter();
  const dayIndex = Number(params.get("day") ?? 0);
  // "right now" mode: /workout?now=1&minutes=30&focus=upper&goal=muscle
  const quick = params.get("now") === "1";
  const qMinutes = Number(params.get("minutes") ?? 30) as Profile["minutes"];
  const qFocus = (params.get("focus") ?? "full") as Focus;
  const qGoal = (params.get("goal") ?? "general") as Goal;

  const [profile] = useState(() => store.getProfile());
  const [lastSets] = useState(() => store.getLastSets());
  const [weekSeed] = useState(() => (profile ? Math.floor(store.getSessionsDone() / profile.days) : 0));
  const [quickSeed] = useState(() => store.getHistory().filter((h) => h.quick).length);
  useEffect(() => {
    if (!profile && !quick) router.replace("/");
  }, [profile, quick, router]);

  const base = useMemo(
    () => (quick ? generateQuick(qGoal, qMinutes, qFocus, quickSeed) : profile ? generateSession(profile, dayIndex, weekSeed) : null),
    [quick, qGoal, qMinutes, qFocus, quickSeed, profile, dayIndex, weekSeed],
  );
  // Swaps replace the exercise in a block; logs are keyed by block index.
  const [swaps, setSwaps] = useState<Record<number, Exercise>>({});
  const [logs, setLogs] = useState<Record<number, SetLog[]>>({});
  const [rest, setRest] = useState<{ total: number; left: number } | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef<number | null>(null);

  // Presence heartbeat: counted as "in the gym" while this screen is open.
  useEffect(() => {
    sync.presence("start");
    const id = setInterval(() => { if (document.visibilityState === "visible") sync.presence("start"); }, 60_000);
    return () => clearInterval(id);
  }, []);

  // Session clock.
  useEffect(() => {
    startedAt.current = Date.now();
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - (startedAt.current ?? Date.now())) / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  // Rest countdown with beep + vibration at zero.
  useEffect(() => {
    if (!rest || rest.left <= 0) return;
    const id = setTimeout(() => {
      const left = rest.left - 1;
      if (left === 0) { beep(); navigator.vibrate?.([200, 100, 200]); }
      setRest({ ...rest, left });
    }, 1000);
    return () => clearTimeout(id);
  }, [rest]);

  if (!base) return null;

  const blocks: Block[] = base.blocks.map((b, i) => (swaps[i] ? { ...b, exercise: swaps[i], alternatives: [b.exercise, ...b.alternatives.filter((a) => a.id !== swaps[i].id)] } : b));

  const logSet = (i: number, set: SetLog, restSec: number) => {
    setLogs((l) => ({ ...l, [i]: [...(l[i] ?? []), set] }));
    if (restSec > 0) setRest({ total: restSec, left: restSec });
  };

  const finish = async () => {
    const entry: HistoryEntry = {
      id: newId(),
      date: new Date().toISOString(),
      title: base.title,
      dayIndex,
      quick,
      sets: blocks.map((b, i) => ({ exerciseId: b.exercise.id, sets: logs[i] ?? [] })).filter((s) => s.sets.length),
    };
    store.finishSession(entry);
    sync.presence("end");
    await sync.pushSessions([entry]);
    const loaded = blocks.flatMap((b, i) => (b.kind === "main" ? (logs[i] ?? []).map((s) => s.reps >= b.repMax) : []));
    const top = loaded.length > 0 && loaded.every(Boolean) ? "1" : "0";
    router.push(`/done?t=${elapsed}&top=${top}`);
  };

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-5 pb-36 pt-8">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <Link href="/" className="text-xs text-muted">← back</Link>
          <p className="eyebrow mt-3">{quick ? "right now" : `day ${dayIndex + 1}`}</p>
          <h1 className="display mt-1 text-3xl leading-tight">{base.title}</h1>
        </div>
        <span className="display text-2xl text-muted tabular-nums">{fmt(elapsed)}</span>
      </header>

      <ol className="space-y-3">
        {blocks.map((b, i) => (
          <BlockCard key={i} block={b} last={lastSets[b.exercise.id]} logged={logs[i] ?? []} onLog={(s) => logSet(i, s, b.restSec)} onSwap={(ex) => setSwaps((s) => ({ ...s, [i]: ex }))} />
        ))}
      </ol>

      <button className="btn mt-10 w-full" onClick={finish}>
        finish
      </button>

      {rest && rest.left > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/95 p-5 backdrop-blur">
          <div className="mx-auto flex max-w-md items-center justify-between">
            <div>
              <div className="eyebrow">rest</div>
              <div className="display text-5xl tabular-nums">{fmt(rest.left)}</div>
              <div className="mt-1 max-w-[230px] text-xs leading-snug text-muted">
                {restLine(Object.values(logs).reduce((n, l) => n + l.length, 0)).text}
                <span className="block text-[10px] opacity-70">— {restLine(Object.values(logs).reduce((n, l) => n + l.length, 0)).by}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="choice" onClick={() => setRest({ ...rest, left: rest.left + 30 })}>+30 s</button>
              <button className="btn" onClick={() => setRest(null)}>skip</button>
            </div>
          </div>
          <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${(rest.left / rest.total) * 100}%` }} />
          </div>
        </div>
      )}
    </main>
  );
}

function BlockCard({ block, last, logged, onLog, onSwap }: { block: Block; last?: SetLog[]; logged: SetLog[]; onLog: (s: SetLog) => void; onSwap: (e: Exercise) => void }) {
  const ex = block.exercise;
  const [open, setOpen] = useState(false);
  const [swapOpen, setSwapOpen] = useState(false);
  const suggestion = suggestLoad(ex, last, block.repMax);
  const [weight, setWeight] = useState<string>(suggestion.weight?.toString() ?? "");
  const [reps, setReps] = useState<string>(ex.timed ? String(block.repMax) : "");
  const isFlow = block.kind === "flow" || block.kind === "warmup" || block.kind === "cooldown";
  const done = logged.length >= block.sets;
  const needsLoad = ex.load !== "bodyweight" && ex.load !== "time";

  return (
    <li className={`card p-4 ${done ? "opacity-50" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="eyebrow">{block.kind}</div>
          <button className="display text-left text-xl leading-tight" onClick={() => setOpen((o) => !o)}>
            {ex.name}
          </button>
          <div className="mt-0.5 text-sm text-muted">
            {isFlow ? block.reps : `${block.sets} × ${block.reps}`}
            {ex.unilateral ? " each side" : ""}
            {block.restSec ? ` · rest ${block.restSec}s` : ""}
          </div>
        </div>
        {block.alternatives.length > 0 && (
          <button className="choice px-2 py-1 text-xs" onClick={() => setSwapOpen((s) => !s)}>swap</button>
        )}
      </div>

      {swapOpen && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {block.alternatives.map((a) => (
            <button key={a.id} className="choice px-2 py-1 text-xs" onClick={() => { onSwap(a); setSwapOpen(false); }}>
              {a.name}
            </button>
          ))}
        </div>
      )}

      {open && (
        <div className="mt-4 space-y-3 text-sm leading-relaxed">
          <Frames exercise={ex} />
          <div className="text-xs text-muted">
            {ex.equipment.map((id) => equipmentById[id].name).join(", ")} · {ex.muscles.join(", ")}
          </div>
          <ol className="list-decimal space-y-1.5 pl-4 text-fg/90">
            {ex.howTo.map((s, i) => <li key={i}>{s}</li>)}
          </ol>
          <div className="text-muted">
            <span className="text-sand">cues · </span>
            {ex.cues.join(" · ")}
          </div>
          {ex.mistakes && (
            <div className="text-muted">
              <span className="text-sand">avoid · </span>
              {ex.mistakes.join(" · ")}
            </div>
          )}
          <a href={youtubeSearchUrl(ex)} target="_blank" rel="noreferrer" className="inline-block text-sand underline">
            watch a demo ↗
          </a>
        </div>
      )}

      {!isFlow && last && last.length > 0 && (
        <div className="mt-3 text-xs text-muted">
          last time · {last[0].weight != null ? `${last[0].weight} × ` : ""}
          {last.map((s) => s.reps).join(", ")}
          {suggestion.up && needsLoad && <span className="ml-1 text-sand">→ try {suggestion.weight}</span>}
          {suggestion.up && !needsLoad && <span className="ml-1 text-sand">→ add reps or load</span>}
        </div>
      )}

      {!isFlow && logged.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5 font-mono text-xs text-muted">
          {logged.map((s, i) => (
            <span key={i} className="rounded-md bg-surface-2 px-2 py-0.5 text-sand">
              {s.weight != null ? `${s.weight}×` : ""}{s.reps}{ex.timed ? "s" : ""}
            </span>
          ))}
        </div>
      )}

      {!done && (isFlow ? (
        <button className="btn-ghost mt-4 w-full text-center" onClick={() => onLog({ weight: null, reps: 1 })}>
          done
        </button>
      ) : (
        <div className="mt-4 flex gap-2">
          {needsLoad && (
            <input className="input w-24" type="number" inputMode="decimal" placeholder="lb" value={weight} onChange={(e) => setWeight(e.target.value)} />
          )}
          <input className="input w-24" type="number" inputMode="numeric" placeholder={ex.timed ? "sec" : "reps"} value={reps} onChange={(e) => setReps(e.target.value)} />
          <button className="btn flex-1" disabled={!reps} onClick={() => onLog({ weight: needsLoad && weight !== "" ? Number(weight) : null, reps: Number(reps) })}>
            log set {logged.length + 1}
          </button>
        </div>
      ))}
    </li>
  );
}

/** Start/end photos alternated every second, or an embedded video when there are no photos. */
function Frames({ exercise }: { exercise: Exercise }) {
  const frames = mediaFrames(exercise);
  const embed = videoEmbedUrl(exercise);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (paused || frames.length < 2) return;
    const id = setInterval(() => setI((x) => (x + 1) % frames.length), 1000);
    return () => clearInterval(id);
  }, [paused, frames.length]);
  if (!frames.length && embed) {
    return (
      <div className="overflow-hidden rounded-xl bg-surface-2">
        <iframe
          src={embed}
          title={`${exercise.name} demo`}
          className="aspect-video w-full"
          loading="lazy"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }
  if (!frames.length || failed) return null;
  return (
    <button type="button" onClick={() => setPaused((p) => !p)} className="relative block w-full overflow-hidden rounded-xl bg-surface-2">
      {/* eslint-disable-next-line @next/next/no-img-element -- remote photos, two frames, no optimisation needed */}
      <img src={frames[i]} alt={`${exercise.name}, ${i === 0 ? "start" : "end"} position`} className="aspect-[4/3] w-full object-contain" onError={() => setFailed(true)} />
      <span className="absolute bottom-2 right-2 font-mono text-[10px] text-muted">{i === 0 ? "start" : "end"}{paused ? " · paused" : ""}</span>
    </button>
  );
}

function fmt(sec: number) {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
}

function beep() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = 880; g.gain.value = 0.2;
    o.start(); o.stop(ctx.currentTime + 0.3);
  } catch { /* audio blocked; vibration still fires */ }
}
