"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sync } from "@/lib/sync";
import { randomVerse } from "@/lib/fun";

// The front door. Reached from the QR on the gym wall (/join?code=…) or by
// anyone who opens the app signed out. One screen: why, then who.

export default function Welcome() {
  const router = useRouter();
  const [params] = useState(() => new URLSearchParams(window.location.search));
  const prefilled = (params.get("code") ?? "").toUpperCase();
  const next = params.get("next") ?? "/";
  const [verse] = useState(() => randomVerse());
  const [code, setCode] = useState(prefilled);
  const [editCode, setEditCode] = useState(!prefilled);
  const [nickname, setNickname] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Already a member on this phone: straight in.
    if (sync.getMe()) router.replace(next);
  }, [router, next]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const r = await sync.join(code, nickname, pin);
    setBusy(false);
    if (!r.ok) { setError(r.error); return; }
    router.push(next === "/" ? "/?welcome=1" : next);
  };

  return (
    <main className={`mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-16 pt-16 fadeup`}>
      <p className="eyebrow">321gym</p>
      <h1 className="display mt-3 text-5xl leading-[1.05]">the gym is downstairs.</h1>
      <p className="mt-5 text-base leading-relaxed text-muted">
        tell it how long you have. it builds a session from the machines in this room, shows you how, times your rest, and remembers what you lifted.
      </p>

      <blockquote className="mt-8 border-l border-sand/40 pl-4">
        <p className="display text-lg leading-snug text-fg/90">{verse.text}</p>
        <p className="mt-1 text-xs text-muted">— {verse.by}</p>
      </blockquote>

      <form onSubmit={submit} className="card mt-10 space-y-6 p-4">
        <div>
          <span className="label">building</span>
          {editCode ? (
            <input className="input uppercase" value={code} onChange={(e) => setCode(e.target.value)} placeholder="the code on the gym wall" autoCapitalize="characters" autoComplete="off" required />
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm"><span className="text-sand">✓</span> {code.toLowerCase()}</span>
              <button type="button" className="text-xs text-muted underline" onClick={() => setEditCode(true)}>change</button>
            </div>
          )}
        </div>
        <div>
          <span className="label">what should we call you</span>
          <input className="input" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="a nickname" autoComplete="username" maxLength={24} required />
        </div>
        <div>
          <span className="label">a 4-digit pin</span>
          <input className="input tracking-[0.4em]" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="····" inputMode="numeric" autoComplete="current-password" required />
          <p className="mt-2 text-xs text-muted">new here → this becomes your pin. been here → type yours.</p>
        </div>
        {error && <p className="text-sm text-accent">{error}</p>}
        <button className="btn w-full" disabled={busy || pin.length !== 4}>
          {busy ? "…" : "let's go"}
        </button>
      </form>

      <p className="mt-6 text-xs text-muted">free for residents. no email, no password, nothing to forget except four digits.</p>
    </main>
  );
}
