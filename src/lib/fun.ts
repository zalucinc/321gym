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

// Philosophers on struggle, pain and work. Public-domain translations
// (long 1862, gummere 1917, jowett 1871, legge 1891, cotton 1685), attributed.
const VERSE: Verse[] = [
  { text: "difficulties strengthen the mind, as labor does the body.", by: "seneca, on providence" },
  { text: "fire tests gold; suffering tests brave men.", by: "seneca, on providence" },
  { text: "no man is more unhappy than he who never faces adversity, for he is not permitted to prove himself.", by: "seneca, on providence" },
  { text: "it is not because things are difficult that we do not dare; it is because we do not dare that things are difficult.", by: "seneca, letters, 104" },
  { text: "we suffer more often in imagination than in reality.", by: "seneca, letters, 13" },
  { text: "the art of life is more like the wrestler's art than the dancer's.", by: "marcus aurelius, meditations, vii" },
  { text: "nothing happens to any man which he is not formed by nature to bear.", by: "marcus aurelius, meditations, v" },
  { text: "that which is an impediment is made a furtherance to an act; and that which is an obstacle on the road helps us on this road.", by: "marcus aurelius, meditations, v" },
  { text: "in the morning when you rise unwillingly, let this thought be present: i am rising to the work of a human being.", by: "marcus aurelius, meditations, v" },
  { text: "it is difficulties that show what men are.", by: "epictetus, discourses, i.24" },
  { text: "first say to yourself what you would be; and then do what you have to do.", by: "epictetus, discourses, iii.23" },
  { text: "no man is free who is not master of himself.", by: "epictetus" },
  { text: "that which does not kill me makes me stronger.", by: "nietzsche, twilight of the idols, 1888" },
  { text: "he who has a why to live can bear almost any how.", by: "nietzsche, twilight of the idols, 1888" },
  { text: "the way up and the way down are one and the same.", by: "heraclitus" },
  { text: "the first and best victory is to conquer self.", by: "plato, laws" },
  { text: "the greater the difficulty, the greater the glory.", by: "cicero, de officiis" },
  { text: "the journey of a thousand miles began with a single step.", by: "lao tzu, tao te ching, 64" },
  { text: "he who fears he shall suffer, already suffers what he fears.", by: "montaigne, essays" },
  { text: "mostly it is loss which teaches us about the worth of things.", by: "schopenhauer" },
  { text: "you have a right to the work, but never to its fruit.", by: "bhagavad gita, 2.47" },
  { text: "it is not enough to be busy; so are the ants. the question is: what are we busy about?", by: "thoreau, 1857" },
  { text: "that which we persist in doing becomes easier, not that the nature of the thing has changed, but that our power to do has increased.", by: "emerson" },
  { text: "we are what we repeatedly do. excellence, then, is not an act, but a habit.", by: "will durant on aristotle, 1926" },
]

/** A fresh line on every open, never the same as the last one shown. */
export function randomVerse(): Verse {
  const KEY = "gym.lastVerse";
  const last = Number(sessionStorage.getItem(KEY) ?? -1);
  let i = Math.floor(Math.random() * VERSE.length);
  if (i === last) i = (i + 1) % VERSE.length;
  sessionStorage.setItem(KEY, String(i));
  return VERSE[i];
}

/** Verse under the rest timer. Picks by set count so it changes through the session. */
export function restLine(n: number): Verse {
  // Offset so the rest verse differs from today's greeting verse.
  return VERSE[(n * 7 + 3) % VERSE.length];
}
