"use client";

import { store, type HistoryEntry } from "./store";
import type { Profile } from "./generate";

// Client side of shared accounts. localStorage stays the source the UI reads;
// when signed in we hydrate it from the server on load and push writes.
// Failed pushes queue in localStorage and retry on the next load.

export interface Me { nickname: string; building: string }
export interface BuildingRow { nickname: string; sessions: number }

const PENDING = "gym.pendingSessions";
const ME = "gym.me";

export const sync = {
  getMe: (): Me | null => {
    try { return JSON.parse(localStorage.getItem(ME) ?? "null"); } catch { return null; }
  },

  /** Pull everything from the server, replace local, flush the queue. Returns null when signed out. */
  async hydrate(): Promise<{ me: Me; building: BuildingRow[] } | null> {
    await this.flush();
    const r = await fetch("/api/me", { cache: "no-store" }).catch(() => null);
    if (!r || r.status === 401) { localStorage.removeItem(ME); return null; }
    if (!r.ok) return null;
    const data = (await r.json()) as { member: Me; profile: Profile | null; history: HistoryEntry[]; building: BuildingRow[] };
    localStorage.setItem(ME, JSON.stringify(data.member));
    if (data.profile) store.setProfile(data.profile);
    if (data.history.length) store.replaceHistory(data.history);
    return { me: data.member, building: data.building };
  },

  async join(code: string, nickname: string, pin: string): Promise<{ ok: true } | { ok: false; error: string }> {
    const r = await fetch("/api/join", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code, nickname, pin }) }).catch(() => null);
    if (!r) return { ok: false, error: "no connection." };
    const data = await r.json().catch(() => ({}));
    if (!r.ok) return { ok: false, error: data.error ?? "something went wrong." };
    localStorage.setItem(ME, JSON.stringify(data.member));
    // First join from a phone with local history: send it all up.
    const local = store.getHistory();
    if (local.length) await this.pushSessions(local);
    const p = store.getProfile();
    if (p) await this.pushProfile(p);
    return { ok: true };
  },

  async signOut() {
    await fetch("/api/logout", { method: "POST" }).catch(() => null);
    localStorage.removeItem(ME);
  },

  async pushProfile(p: Profile) {
    if (!this.getMe()) return;
    await fetch("/api/profile", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(p) }).catch(() => null);
  },

  async pushSessions(list: HistoryEntry[]) {
    if (!this.getMe() || !list.length) return;
    const r = await fetch("/api/sessions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(list) }).catch(() => null);
    if (!r || !r.ok) {
      const pending: HistoryEntry[] = JSON.parse(localStorage.getItem(PENDING) ?? "[]");
      localStorage.setItem(PENDING, JSON.stringify([...pending, ...list]));
    }
  },

  async flush() {
    const pending: HistoryEntry[] = JSON.parse(localStorage.getItem(PENDING) ?? "[]");
    if (!pending.length || !this.getMe()) return;
    localStorage.removeItem(PENDING);
    await this.pushSessions(pending);
  },
};
