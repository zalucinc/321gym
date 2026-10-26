import type { Focus, Goal, Profile } from "./generate";
import type { HistoryEntry, LastSets } from "./store";
import { suggestLoad } from "./store";
import { exerciseById } from "./exercises";
import { generateSession } from "./generate";

// Short, specific nudges from what's actually in the log. Rules follow the
// evidence file: ~48 h between sessions for the same muscles (convention),
// double progression when every set hits the top of the range, an easier
// week after a long streak (Bell 2023), and "any amount counts" (WHO 2020).

export interface Recommendation {
  /** Suggested focus for a "right now" session. */
  focus: Focus;
  notes: string[];
}

const LOWER = new Set(["squat", "hinge", "lunge", "glutes", "legs_iso"]);
const UPPER = new Set(["hpush", "vpush", "hpull", "vpull", "arms", "shoulders_iso"]);

function bodyPart(entry: HistoryEntry): "upper" | "lower" | "mixed" | "other" {
  let lo = 0, up = 0;
  for (const s of entry.sets) {
    const p = exerciseById[s.exerciseId]?.pattern;
    if (!p) continue;
    if (LOWER.has(p)) lo++;
    if (UPPER.has(p)) up++;
  }
  if (!lo && !up) return "other";
  if (lo && !up) return "lower";
  if (up && !lo) return "upper";
  return "mixed";
}

export function recommend(history: HistoryEntry[], lastSets: LastSets, profile: Profile, now = new Date()): Recommendation {
  const notes: string[] = [];
  const goal: Goal = profile.goal;
  let focus: Focus = goal === "pilates" ? "pilates" : "full";

  const last = history[0];
  if (!last) {
    notes.push("first one. keep every weight a little lighter than you think — the log does the rest.");
    return { focus, notes };
  }

  const hours = (now.getTime() - new Date(last.date).getTime()) / 36e5;
  const days = Math.floor(hours / 24);
  const part = bodyPart(last);

  // Recovery and what to train today.
  if (hours < 6) {
    notes.push("you already trained today. if you're going back down, make it easy cardio or a mobility flow.");
    focus = "cardio";
  } else if (hours < 40 && part === "lower") {
    notes.push("legs were yesterday. give them the day — upper body or pilates today.");
    focus = goal === "pilates" ? "pilates" : "upper";
  } else if (hours < 40 && part === "upper") {
    notes.push("upper body was yesterday. lower body today keeps the 48-hour gap.");
    focus = goal === "pilates" ? "pilates" : "lower";
  } else if (hours < 40 && part === "mixed") {
    notes.push("full body yesterday. a short cardio + core session or a rest day is the right call.");
    focus = "cardio";
  } else if (days >= 7) {
    notes.push(`it's been ${days} days. come back at last session's weights, not heavier — strength is still there, the groove isn't.`);
  } else if (days >= 3) {
    notes.push(`${days} days off, you're recovered. a good day to push.`);
  }

  // Progression: which exercises earned a step up.
  const ups: string[] = [];
  for (const s of last.sets) {
    const ex = exerciseById[s.exerciseId];
    if (!ex) continue;
    const scheme = planRepMax(profile, ex.id);
    const sug = suggestLoad(ex, lastSets[ex.id], scheme);
    if (sug.up && sug.weight != null && lastSets[ex.id]?.[0]?.weight != null && sug.weight > (lastSets[ex.id][0].weight as number)) {
      ups.push(`${ex.name} → ${sug.weight}`);
    }
  }
  if (ups.length) notes.push(`you hit every rep last time on ${ups.slice(0, 3).join(", ")}. go up today.`);

  // Sets that fell short of the range: hold the weight.
  const holds = last.sets
    .filter((s) => {
      const sets = s.sets.filter((x) => x.weight != null);
      if (sets.length < 2) return false;
      const min = planRepMin(profile);
      return sets.some((x) => x.reps < min);
    })
    .map((s) => exerciseById[s.exerciseId]?.name)
    .filter(Boolean) as string[];
  if (holds.length) notes.push(`${holds.slice(0, 2).join(" and ")} fell under the rep range. same weight today, chase the reps.`);

  // Long streak → easier week.
  const weeks = consecutiveFullWeeks(history, profile.days, now);
  if (weeks >= 6) notes.push(`${weeks} weeks straight at full volume. make this one easier: two sets instead of three, same weights.`);

  // Weekly target.
  const thisWeek = history.filter((h) => sameWeek(new Date(h.date), now)).length;
  if (goal !== "pilates" && thisWeek >= profile.days) notes.push(`that's ${thisWeek} this week — target met. anything extra is a bonus, keep it light.`);

  return { focus, notes: notes.slice(0, 3) };
}

/** Top of the rep range this exercise would get in the user's plan today. */
function planRepMax(profile: Profile, exerciseId: string): number {
  // Cheap: look at what the plan generator assigns for this goal.
  const s = generateSession(profile, 0, 0);
  const b = s.blocks.find((x) => x.exercise.id === exerciseId);
  if (b) return b.repMax;
  switch (profile.goal) {
    case "strength": return 6;
    case "muscle": return 12;
    case "fatloss": return 15;
    default: return 10;
  }
}
function planRepMin(profile: Profile): number {
  switch (profile.goal) {
    case "strength": return 3;
    case "muscle": return 8;
    case "fatloss": return 12;
    default: return 8;
  }
}

function weekStart(d: Date) {
  const x = new Date(d);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}
function sameWeek(a: Date, b: Date) {
  return weekStart(a) === weekStart(b);
}
function consecutiveFullWeeks(history: HistoryEntry[], target: number, now: Date) {
  const counts = new Map<number, number>();
  for (const h of history) {
    const k = weekStart(new Date(h.date));
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const WEEK = 7 * 864e5;
  let cursor = weekStart(now) - WEEK; // completed weeks only
  let n = 0;
  while ((counts.get(cursor) ?? 0) >= target) { n++; cursor -= WEEK; }
  return n;
}
