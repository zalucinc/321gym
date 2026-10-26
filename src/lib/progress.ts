import type { HistoryEntry } from "./store";
import { exerciseById } from "./exercises";

// Attendance and strength trends from the local history. No gamification
// theatre: counts, streaks and real numbers.

export interface Trend { exerciseId: string; name: string; first: number; latest: number; best: number; sessions: number; pct: number }

export interface Progress {
  total: number;
  thisWeek: number;
  /** Consecutive weeks (ending this week or last) with at least one session. */
  streakWeeks: number;
  /** Next round-number milestone and how far away it is. */
  nextMilestone: { at: number; left: number } | null;
  trends: Trend[];
}

const MILESTONES = [1, 5, 10, 25, 50, 100, 150, 200, 365];

/** Epley estimated one-rep max. Reps capped so a 20-rep set doesn't inflate it. */
export function e1rm(weight: number, reps: number) {
  return Math.round(weight * (1 + Math.min(reps, 12) / 30));
}

function weekKey(d: Date) {
  // ISO-ish week bucket: Monday-start.
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

export function computeProgress(history: HistoryEntry[], now = new Date()): Progress {
  const total = history.length;
  const weeks = new Set(history.map((h) => weekKey(new Date(h.date))));
  const thisWeekKey = weekKey(now);
  const WEEK = 7 * 24 * 3600 * 1000;
  const thisWeek = history.filter((h) => weekKey(new Date(h.date)) === thisWeekKey).length;

  // Streak counts back from this week, or last week if this week is still empty.
  let cursor = weeks.has(thisWeekKey) ? thisWeekKey : thisWeekKey - WEEK;
  let streakWeeks = 0;
  while (weeks.has(cursor)) { streakWeeks++; cursor -= WEEK; }

  const nextAt = MILESTONES.find((m) => m > total);
  const nextMilestone = nextAt ? { at: nextAt, left: nextAt - total } : null;

  // Strength: best e1RM per exercise per session, oldest → newest.
  const byEx = new Map<string, number[]>();
  for (const h of [...history].reverse()) {
    for (const s of h.sets) {
      const loaded = s.sets.filter((x) => x.weight != null && x.reps > 0);
      if (!loaded.length) continue;
      const best = Math.max(...loaded.map((x) => e1rm(x.weight as number, x.reps)));
      byEx.set(s.exerciseId, [...(byEx.get(s.exerciseId) ?? []), best]);
    }
  }
  const trends: Trend[] = [];
  for (const [exerciseId, series] of byEx) {
    if (series.length < 2) continue;
    const first = series[0], latest = series[series.length - 1], best = Math.max(...series);
    trends.push({ exerciseId, name: exerciseById[exerciseId]?.name ?? exerciseId, first, latest, best, sessions: series.length, pct: Math.round(((latest - first) / first) * 100) });
  }
  trends.sort((a, b) => b.pct - a.pct);

  return { total, thisWeek, streakWeeks, nextMilestone, trends };
}
