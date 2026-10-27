"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { sync } from "@/lib/sync";

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const r = await sync.join(code, nickname, pin);
    setBusy(false);
    if (!r.ok) { setError(r.error); return; }
    router.push("/");
  };

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-5 pb-24 pt-12">
      <Link href="/" className="text-xs text-muted">← back</Link>
      <h1 className="display mt-6 text-4xl leading-tight">join the building</h1>
      <p className="mt-2 text-sm text-muted">your sessions follow you to any phone, and you show up in this week&apos;s tally.</p>

      <form onSubmit={submit} className="card mt-8 space-y-6 p-4">
        <div>
          <span className="label">building code</span>
          <input className="input uppercase" value={code} onChange={(e) => setCode(e.target.value)} placeholder="on the gym door" autoCapitalize="characters" autoComplete="off" required />
        </div>
        <div>
          <span className="label">nickname</span>
          <input className="input" value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="what neighbours call you" autoComplete="username" maxLength={24} required />
        </div>
        <div>
          <span className="label">4-digit pin</span>
          <input className="input tracking-[0.4em]" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="····" inputMode="numeric" autoComplete="current-password" required />
          <p className="mt-2 text-xs text-muted">new nickname → this becomes its pin. existing one → type its pin.</p>
        </div>
        {error && <p className="text-sm text-accent">{error}</p>}
        <button className="btn w-full" disabled={busy || pin.length !== 4}>
          {busy ? "…" : "join"}
        </button>
      </form>
    </main>
  );
}
