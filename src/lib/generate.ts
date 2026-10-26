import { equipmentById } from "./equipment";
import { EXERCISES, type Exercise, type Pattern } from "./exercises";
import { PILATES } from "./pilates";
import { PILATES_VIDEOS } from "./pilates-videos";

export type Goal = "muscle" | "strength" | "fatloss" | "general" | "pilates";
export const GOALS: { id: Goal; label: string; blurb: string }[] = [
  { id: "muscle", label: "build muscle", blurb: "moderate weight, 8–12 reps, 90 s rest" },
  { id: "strength", label: "get stronger", blurb: "heavy weight, 3–6 reps, long rest" },
  { id: "fatloss", label: "lose fat", blurb: "higher reps, short rest, a finisher" },
  { id: "general", label: "general fitness", blurb: "balanced strength + cardio" },
  { id: "pilates", label: "mat pilates", blurb: "classical mat sequence, yoga room" },
];
export const MINUTES = [20, 30, 45, 60] as const;
export const DAYS = [2, 3, 4, 5, 6] as const;

export interface Profile {
  name: string;
  goal: Goal;
  minutes: (typeof MINUTES)[number];
  days: (typeof DAYS)[number];
}

export interface Block {
  kind: "warmup" | "main" | "finisher" | "cooldown" | "flow";
  exercise: Exercise;
  sets: number;
  /** Rep target, e.g. "8–12". Timed blocks use seconds ("30–45 s"). */
  reps: string;
  repMax: number; // top of the rep range, used by progression
  restSec: number;
  /** Other exercises of the same pattern the user can swap to if the station is busy. */
  alternatives: Exercise[];
  minutes: number;
}

export interface Session {
  title: string;
  dayIndex: number;
  blocks: Block[];
  totalMinutes: number;
}

// Pattern lists per training day. The generator trims from the end to fit time.
const FULL_BODY: Pattern[][] = [
  ["squat", "hpush", "hpull", "hinge", "core", "arms", "conditioning"],
  ["hinge", "vpull", "vpush", "lunge", "core", "shoulders_iso", "conditioning"],
  ["squat", "hpull", "hpush", "glutes", "legs_iso", "core", "conditioning"],
];
const UPPER_LOWER: { title: string; patterns: Pattern[] }[] = [
  { title: "lower · squat focus", patterns: ["squat", "hinge", "lunge", "legs_iso", "core", "conditioning"] },
  { title: "upper · push focus", patterns: ["hpush", "vpull", "vpush", "shoulders_iso", "arms", "core"] },
  { title: "lower · hinge focus", patterns: ["glutes", "hinge", "lunge", "legs_iso", "core", "conditioning"] },
  { title: "upper · pull focus", patterns: ["vpull", "hpull", "hpush", "shoulders_iso", "arms", "core"] },
];
const CARDIO_CORE: Pattern[] = ["cardio", "core", "core", "mobility"];

interface Scheme { sets: number; reps: string; repMax: number; restSec: number }

function mainScheme(goal: Goal): Scheme {
  switch (goal) {
    case "strength": return { sets: 3, reps: "3–6", repMax: 6, restSec: 150 };
    case "muscle": return { sets: 3, reps: "8–12", repMax: 12, restSec: 90 };
    case "fatloss": return { sets: 3, reps: "12–15", repMax: 15, restSec: 45 };
    default: return { sets: 3, reps: "8–10", repMax: 10, restSec: 60 };
  }
}
const ISO: Scheme = { sets: 3, reps: "12–15", repMax: 15, restSec: 60 };
const CORE: Scheme = { sets: 3, reps: "12–15", repMax: 15, restSec: 45 };
const TIMED: Scheme = { sets: 3, reps: "30–45 s", repMax: 45, restSec: 45 };
const COMPOUND = new Set<Pattern>(["squat", "hinge", "lunge", "glutes", "hpush", "vpush", "hpull", "vpull"]);

const WORK_SEC_PER_SET = 40;

/** Exercises whose every piece of equipment is currently available. */
export function availableExercises(): Exercise[] {
  return EXERCISES.filter((e) => e.equipment.every((id) => equipmentById[id]?.available));
}

function pick(pattern: Pattern, seed: number, pool: Exercise[]): { exercise: Exercise; alternatives: Exercise[] } | null {
  const candidates = pool.filter((e) => e.pattern === pattern);
  if (!candidates.length) return null;
  const i = ((seed % candidates.length) + candidates.length) % candidates.length;
  return { exercise: candidates[i], alternatives: candidates.filter((_, j) => j !== i) };
}

function schemeFor(ex: Exercise, pattern: Pattern, goal: Goal): Scheme {
  if (ex.timed) return TIMED;
  if (pattern === "core") return CORE;
  if (COMPOUND.has(pattern)) return mainScheme(goal);
  return ISO;
}

function blockMinutes(sets: number, restSec: number, unilateral?: boolean) {
  const work = WORK_SEC_PER_SET * (unilateral ? 2 : 1);
  return Math.round(((sets * (work + restSec)) / 60) * 10) / 10;
}

/**
 * Build one session. `weekSeed` rotates exercise choice week to week so the same
 * day doesn't always produce the same list.
 */
export function generateSession(profile: Profile, dayIndex: number, weekSeed = 0): Session {
  if (profile.goal === "pilates") return generatePilates(profile, dayIndex, weekSeed);

  const pool = availableExercises();
  const seed = dayIndex * 7 + weekSeed;
  const blocks: Block[] = [];

  let title: string;
  let patterns: Pattern[];
  if (profile.days <= 3) {
    const t = FULL_BODY[dayIndex % FULL_BODY.length];
    title = `full body ${String.fromCharCode(97 + (dayIndex % FULL_BODY.length))}`;
    patterns = t;
  } else if (dayIndex < 4) {
    title = UPPER_LOWER[dayIndex].title;
    patterns = UPPER_LOWER[dayIndex].patterns;
  } else {
    title = "cardio + core";
    patterns = CARDIO_CORE;
  }

  // Warm-up: 5 min easy cardio. Always.
  const warm = pick("cardio", seed + 1, pool);
  if (warm) blocks.push({ kind: "warmup", exercise: warm.exercise, sets: 1, reps: "5 min easy", repMax: 5, restSec: 0, alternatives: warm.alternatives, minutes: 5 });

  let budget = profile.minutes - 5;
  const cooldownMin = profile.minutes >= 45 ? 5 : 0;
  budget -= cooldownMin;

  const used = new Set<string>();
  for (const [slot, pattern] of patterns.entries()) {
    // Cardio day: steady cardio takes most of the time.
    if (pattern === "cardio") {
      const c = pick("cardio", seed + slot, pool);
      if (!c) continue;
      const mins = Math.max(10, Math.round(budget * 0.6));
      blocks.push({ kind: "main", exercise: c.exercise, sets: 1, reps: `${mins} min steady`, repMax: mins, restSec: 0, alternatives: c.alternatives, minutes: mins });
      budget -= mins;
      continue;
    }
    if (pattern === "mobility") {
      const m = pick("mobility", seed, pool);
      if (m && budget >= 5) blocks.push({ kind: "cooldown", exercise: m.exercise, sets: 1, reps: `${Math.min(10, budget)} min`, repMax: 10, restSec: 0, alternatives: [], minutes: Math.min(10, budget) });
      continue;
    }

    // Avoid repeating an exercise in the same session (e.g. two "core" slots).
    let p = pick(pattern, seed + slot, pool);
    let tries = 0;
    while (p && used.has(p.exercise.id) && tries < 5) { p = pick(pattern, seed + slot + ++tries, pool); }
    if (!p) continue;

    const isFinisher = pattern === "conditioning";
    const sch = isFinisher
      ? { sets: 1, reps: profile.goal === "fatloss" ? "8 min" : "5 min", repMax: 8, restSec: 0 }
      : schemeFor(p.exercise, pattern, profile.goal);
    const mins = isFinisher ? (profile.goal === "fatloss" ? 8 : 5) : blockMinutes(sch.sets, sch.restSec, p.exercise.unilateral);

    // Keep finisher only for fat loss / general, or when there's clearly room.
    if (isFinisher && !(profile.goal === "fatloss" || profile.goal === "general" || budget >= mins + 6)) continue;
    if (mins > budget) {
      // Try fitting a shorter version instead of dropping compound work entirely.
      if (!isFinisher && sch.sets > 2) {
        const short = blockMinutes(2, sch.restSec, p.exercise.unilateral);
        if (short <= budget) {
          blocks.push({ kind: "main", exercise: p.exercise, ...sch, sets: 2, alternatives: p.alternatives, minutes: short });
          used.add(p.exercise.id);
          budget -= short;
        }
      }
      continue;
    }
    blocks.push({ kind: isFinisher ? "finisher" : "main", exercise: p.exercise, ...sch, alternatives: p.alternatives, minutes: mins });
    used.add(p.exercise.id);
    budget -= mins;
  }

  if (cooldownMin && !blocks.some((b) => b.kind === "cooldown")) {
    const m = pick("mobility", seed, pool);
    if (m) blocks.push({ kind: "cooldown", exercise: m.exercise, sets: 1, reps: `${cooldownMin} min`, repMax: cooldownMin, restSec: 0, alternatives: [], minutes: cooldownMin });
  }

  return { title, dayIndex, blocks, totalMinutes: Math.round(blocks.reduce((s, b) => s + b.minutes, 0)) };
}

/**
 * Mat Pilates: the classical order, trimmed to the time available. The first two
 * weeks stay on level-1 moves; after that level-2 moves are mixed in and the
 * starting point rotates so a 20-minute session doesn't always stop at the saw.
 */
function generatePilates(profile: Profile, dayIndex: number, weekSeed: number): Session {
  const level: 1 | 2 = weekSeed >= 2 ? 2 : 1;
  const seq = PILATES.filter((m) => m.level <= level);
  const blocks: Block[] = [];
  let budget = profile.minutes;

  // Breathing warm-up always opens; the seal always closes if there's room.
  const opener = seq[0];
  const closer = seq.find((m) => m.id === "p_seal")!;
  const body = seq.filter((m) => m !== opener && m !== closer);

  // Rotate the start of the body sequence across sessions so every move gets practised.
  const offset = level === 2 ? ((dayIndex + weekSeed) * 3) % body.length : 0;
  const rotated = [...body.slice(offset), ...body.slice(0, offset)];

  const push = (m: typeof opener, kind: Block["kind"]) => {
    blocks.push({ kind, exercise: toExercise(m), sets: 1, reps: m.reps, repMax: 0, restSec: 0, alternatives: [], minutes: m.minutes });
    budget -= m.minutes;
  };
  push(opener, "warmup");
  budget -= closer.minutes;
  // One pass through the series; if time is left (long session, small level-1
  // repertoire), run the series a second time — classical mat classes repeat.
  for (let pass = 0; pass < 2 && budget >= 4; pass++) {
    for (const m of rotated) {
      if (m.minutes > budget) continue;
      push(m, "flow");
    }
  }
  budget += closer.minutes;
  push(closer, "cooldown");

  return { title: `mat pilates · level ${level}`, dayIndex, blocks, totalMinutes: Math.round(blocks.reduce((s, b) => s + b.minutes, 0)) };
}

function toExercise(m: (typeof PILATES)[number]): Exercise {
  return { id: m.id, name: m.name, pattern: "core", equipment: ["mat"], muscles: ["core"], load: "bodyweight", howTo: m.howTo, cues: m.cues, video: m.video ?? PILATES_VIDEOS[m.id] };
}

export function generateWeek(profile: Profile, weekSeed = 0): Session[] {
  return Array.from({ length: profile.days }, (_, i) => generateSession(profile, i, weekSeed));
}

// ---- "right now" sessions --------------------------------------------------
// No plan, no profile needed: someone walks downstairs with 30 minutes.
export type Focus = "full" | "upper" | "lower" | "cardio" | "pilates";
export const FOCUS: { id: Focus; label: string }[] = [
  { id: "full", label: "full body" },
  { id: "upper", label: "upper" },
  { id: "lower", label: "lower" },
  { id: "cardio", label: "cardio + core" },
  { id: "pilates", label: "pilates" },
];

export function generateQuick(goal: Goal, minutes: Profile["minutes"], focus: Focus, seed = 0): Session {
  if (focus === "pilates" || goal === "pilates") {
    return generateSession({ name: "", goal: "pilates", minutes, days: 3 }, seed % 3, Math.floor(seed / 3));
  }
  const g: Goal = goal;
  switch (focus) {
    case "full": return generateSession({ name: "", goal: g, minutes, days: 3 }, seed % 3, Math.floor(seed / 3));
    case "upper": return generateSession({ name: "", goal: g, minutes, days: 4 }, seed % 2 === 0 ? 1 : 3, Math.floor(seed / 2));
    case "lower": return generateSession({ name: "", goal: g, minutes, days: 4 }, seed % 2 === 0 ? 0 : 2, Math.floor(seed / 2));
    case "cardio": return generateSession({ name: "", goal: g, minutes, days: 5 }, 4, seed);
  }
}
