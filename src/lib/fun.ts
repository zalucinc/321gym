import type { HistoryEntry } from "./store";
import type { Progress } from "./progress";

// Earned, specific, a little playful. Never generic cheerleading.

/** Everyday objects for "you lifted X today". Pounds. */
const OBJECTS: [number, string, string][] = [
  [70, "a golden retriever", "golden retrievers"],
  [250, "a vespa", "vespas"],
  [600, "a grizzly bear", "grizzly bears"],
  [1000, "a grand piano", "grand pianos"],
  [1400, "a cow", "cows"],
  [2600, "a giraffe", "giraffes"],
  [3000, "a small car", "small cars"],
  [9000, "an elephant", "elephants"],
  [25000, "a school bus", "school buses"],
];

export function totalVolume(entry: HistoryEntry): number {
  let lb = 0;
  for (const s of entry.sets) for (const x of s.sets) if (x.weight != null) lb += x.weight * x.reps;
  return Math.round(lb);
}

export function volumeInObjects(lb: number): string | null {
  if (lb < 70) return null;
  // Largest object that still gives a multiplier of at least 1; prefer whole numbers.
  let best = OBJECTS[0];
  for (const o of OBJECTS) if (lb >= o[0]) best = o;
  const n = lb / best[0];
  if (n < 1.5) return `about ${best[1]}`;
  const rounded = n < 10 ? Math.round(n * 2) / 2 : Math.round(n);
  return `about ${rounded} ${best[2]}`;
}

export function setsLogged(entry: HistoryEntry): number {
  return entry.sets.reduce((n, s) => n + s.sets.length, 0);
}

export interface FinishContext {
  entry: HistoryEntry;
  progress: Progress; // computed after this session was saved
  minutes: number;
  pilates: boolean;
  allTopOfRange: boolean;
}

export function finishLine(c: FinishContext): string {
  const { progress: p } = c;
  if (p.total === 1) return "one. every regular in this building started at one.";
  if (c.allTopOfRange && !c.pilates) return "every set at the top of the range. next time the weights go up, not you.";
  if (p.streakWeeks >= 8) return `${p.streakWeeks} weeks in a row. this is just what you do now.`;
  if (p.streakWeeks >= 3) return `${p.streakWeeks} weeks straight. the building is starting to notice.`;
  if (p.total === 10) return "ten. you have officially stopped being new.";
  if (p.total === 25 || p.total === 50 || p.total === 100) return `${p.total} sessions. nobody drifts into that number.`;
  if (c.pilates) return "spine: longer. shoulders: lower. that was the whole point.";
  if (c.entry.quick) return `a spare ${c.minutes} minutes turned into that. hard to argue with.`;
  if (p.thisWeek >= 3) return `that's ${p.thisWeek} this week. the elevator can wait.`;
  const pool = [
    "done, and it can't be undone.",
    "future you just sent a thank-you note.",
    "the gym is downstairs. you were in it. that's the trick.",
    "that's one more than most people today.",
  ];
  return pool[p.total % pool.length];
}

/** A line under the greeting, changes once a day. */
export function dailyLine(d = new Date()): string {
  const lines = [
    "built from what's actually downstairs.",
    "the elevator goes both ways. so does the gym.",
    "no commute. no excuse. small gym, big floor.",
    "the smith machine is patient. it will wait for you.",
    "twenty minutes counts. the guidelines say so.",
    "pajamas are acceptable gym wear in this building.",
    "the kettlebells miss you. they said so.",
    "the fifth floor has nothing on your consistency.",
    "down the hall, left at the mats.",
    "somebody has to use the 70s. might as well be you.",
  ];
  const day = Math.floor(d.getTime() / 864e5);
  return lines[day % lines.length];
}

/** Shown under the rest timer. Picks by set count so it changes through the session. */
export function restLine(n: number): string {
  const lines = [
    "breathe. the weights aren't going anywhere.",
    "shake it out. look at something far away.",
    "water, if you brought some.",
    "this is the part that makes the next set count.",
    "rest is training. sit with it.",
    "unclench your jaw. nobody tells you that one.",
    "the last set is the one that matters. this isn't it yet.",
    "stand up straight. shoulders down. good.",
  ];
  return lines[n % lines.length];
}
