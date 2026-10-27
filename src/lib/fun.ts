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

export interface Verse { text: string; by: string }

// Public-domain verse on struggle, pain and work. Short excerpts, attributed.
const VERSE: Verse[] = [
  { text: "under the bludgeonings of chance my head is bloody, but unbowed.", by: "w. e. henley, invictus, 1888" },
  { text: "i am the master of my fate, i am the captain of my soul.", by: "w. e. henley, invictus, 1888" },
  { text: "if you can force your heart and nerve and sinew to serve your turn long after they are gone.", by: "rudyard kipling, if—, 1910" },
  { text: "if you can fill the unforgiving minute with sixty seconds' worth of distance run.", by: "rudyard kipling, if—, 1910" },
  { text: "life for me ain't been no crystal stair.", by: "langston hughes, mother to son, 1922" },
  { text: "so boy, don't you turn back. don't you set down on the steps 'cause you finds it's kinder hard.", by: "langston hughes, mother to son, 1922" },
  { text: "i'se still goin', honey, i'se still climbin'.", by: "langston hughes, mother to son, 1922" },
  { text: "if there is no struggle, there is no progress.", by: "frederick douglass, 1857" },
  { text: "the credit belongs to the man who is actually in the arena, whose face is marred by dust and sweat and blood.", by: "theodore roosevelt, 1910" },
  { text: "who strives valiantly; who errs, who comes short again and again.", by: "theodore roosevelt, 1910" },
  { text: "i know why the caged bird beats his wing till its blood is red on the cruel bars.", by: "paul laurence dunbar, sympathy, 1899" },
  { text: "we never know how high we are till we are called to rise.", by: "emily dickinson, c. 1870" },
  { text: "i am larger, better than i thought; i did not know i held so much goodness.", by: "walt whitman, song of the open road, 1856" },
  { text: "that which we persist in doing becomes easier, not that the nature of the thing has changed, but that our power to do has increased.", by: "ralph waldo emerson" },
  { text: "the art of life is more like the wrestler's art than the dancer's.", by: "marcus aurelius, meditations" },
  { text: "nothing happens to any man which he is not formed by nature to bear.", by: "marcus aurelius, meditations" },
  { text: "difficulties strengthen the mind, as labor does the body.", by: "seneca" },
  { text: "the race is not to the swift, nor the battle to the strong.", by: "ecclesiastes 9:11" },
  { text: "they can because they think they can.", by: "virgil, aeneid" },
  { text: "dripping water hollows out stone, not through force but through persistence.", by: "ovid" },
  { text: "no bird soars too high if he soars with his own wings.", by: "william blake, 1790" },
];

/** Verse under the greeting, changes once a day. */
export function dailyLine(d = new Date()): Verse {
  const day = Math.floor(d.getTime() / 864e5);
  return VERSE[day % VERSE.length];
}

/** Verse under the rest timer. Picks by set count so it changes through the session. */
export function restLine(n: number): Verse {
  // Offset so the rest verse differs from today's greeting verse.
  return VERSE[(n * 7 + 3) % VERSE.length];
}
