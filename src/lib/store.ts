"use client";

import type { Profile } from "./generate";
import type { Exercise } from "./exercises";
import { equipmentById } from "./equipment";

// localStorage is what the UI reads. When signed in, src/lib/sync.ts hydrates
// it from the server and pushes writes; offline it just keeps working.

const KEYS = { profile: "gym.profile", lastSets: "gym.lastSets", history: "gym.history", sessionsDone: "gym.sessionsDone" } as const;

export const newId = () => (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);

export interface SetLog { weight: number | null; reps: number }
export interface LastSets { [exerciseId: string]: SetLog[] }
export interface HistoryEntry { id: string; date: string; title: string; dayIndex: number; quick?: boolean; sets: { exerciseId: string; sets: SetLog[] }[] }

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const store = {
  getProfile: () => read<Profile | null>(KEYS.profile, null),
  setProfile: (p: Profile) => write(KEYS.profile, p),
  getLastSets: () => read<LastSets>(KEYS.lastSets, {}),
  getHistory: () => {
    const h = read<HistoryEntry[]>(KEYS.history, []);
    // Entries logged before shared accounts have no id; assign once so they can sync.
    if (h.some((e) => !e.id)) {
      const fixed = h.map((e) => (e.id ? e : { ...e, id: newId() }));
      write(KEYS.history, fixed);
      return fixed;
    }
    return h;
  },
  getSessionsDone: () => read<number>(KEYS.sessionsDone, 0),
  finishSession(entry: HistoryEntry) {
    const history = read<HistoryEntry[]>(KEYS.history, []);
    history.unshift(entry);
    write(KEYS.history, history.slice(0, 200));
    const last = read<LastSets>(KEYS.lastSets, {});
    for (const s of entry.sets) if (s.sets.length) last[s.exerciseId] = s.sets;
    write(KEYS.lastSets, last);
    // Only planned sessions advance the weekly pointer; a quick session
    // downstairs shouldn't skip tomorrow's plan.
    if (!entry.quick) write(KEYS.sessionsDone, read<number>(KEYS.sessionsDone, 0) + 1);
  },
  /** Server copy wins: rebuild local history, last-set cache and plan pointer from it. */
  replaceHistory(entries: HistoryEntry[]) {
    const sorted = [...entries].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
    write(KEYS.history, sorted.slice(0, 500));
    const last: LastSets = {};
    for (const h of [...sorted].reverse()) for (const s of h.sets) if (s.sets.length) last[s.exerciseId] = s.sets;
    write(KEYS.lastSets, last);
    write(KEYS.sessionsDone, sorted.filter((h) => !h.quick).length);
  },
  reset() {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  },
};

/**
 * Progression: if every set last time hit the top of the rep range, suggest the
 * next load step for that equipment. Otherwise repeat the last weight.
 */
export function suggestLoad(ex: Exercise, last: SetLog[] | undefined, repMax: number): { weight: number | null; up: boolean } {
  if (!last?.length) return { weight: null, up: false };
  const w = last[0].weight;
  const hitAll = last.every((s) => s.reps >= repMax);
  if (w == null || !hitAll || ex.load === "bodyweight" || ex.load === "time") return { weight: w, up: hitAll };
  const steps = ex.equipment.map((id) => equipmentById[id]?.loads).find(Boolean);
  if (steps) {
    const next = steps.find((s) => s > w);
    return { weight: next ?? w, up: next != null };
  }
  const inc = ex.load === "plate" ? 10 : 5;
  return { weight: w + inc, up: true };
}
