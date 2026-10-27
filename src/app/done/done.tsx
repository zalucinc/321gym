"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { store } from "@/lib/store";
import { computeProgress } from "@/lib/progress";
import { finishLine, setsLogged, totalVolume, volumeInObjects } from "@/lib/fun";

export default function Done() {
  return (
    <Suspense>
      <DoneInner />
    </Suspense>
  );
}

function DoneInner() {
  const params = useSearchParams();
  const router = useRouter();
  const seconds = Number(params.get("t") ?? 0);
  const allTop = params.get("top") === "1";
  const [entry] = useState(() => store.getHistory()[0] ?? null);
  const [progress] = useState(() => computeProgress(store.getHistory()));
  useEffect(() => {
    if (!entry) router.replace("/");
  }, [entry, router]);
  if (!entry) return null;

  const minutes = Math.max(1, Math.round(seconds / 60));
  const lb = totalVolume(entry);
  const objects = volumeInObjects(lb);
  const sets = setsLogged(entry);
  const pilates = entry.title.includes("pilates");
  const line = finishLine({ entry, progress, minutes, pilates, allTopOfRange: allTop });

  const stats: [string, string][] = [
    [`${minutes}`, minutes === 1 ? "minute" : "minutes"],
    ...(sets ? ([[`${sets}`, sets === 1 ? "set" : "sets"]] as [string, string][]) : []),
    ...(lb ? ([[lb.toLocaleString(), "lb moved"]] as [string, string][]) : []),
  ];

  return (
    <main className={`mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-16 pt-16 fadeup`}>
      <p className="eyebrow">done · {entry.title}</p>
      <h1 className="display mt-3 text-5xl leading-[1.05]">{line}</h1>

      <div className="mt-10 grid grid-cols-3 gap-2">
        {stats.map(([n, label]) => (
          <div key={label} className="card px-3 py-4">
            <div className="display text-3xl tabular-nums text-sand">{n}</div>
            <div className="mt-1 text-xs text-muted">{label}</div>
          </div>
        ))}
      </div>
      {objects && <p className="mt-3 text-sm text-muted">{lb.toLocaleString()} lb is {objects}.</p>}

      <div className="card mt-8 flex items-center justify-between p-4">
        <div>
          <div className="eyebrow">this week</div>
          <div className="display text-2xl">{progress.thisWeek}</div>
        </div>
        <div>
          <div className="eyebrow">streak</div>
          <div className="display text-2xl">{progress.streakWeeks} {progress.streakWeeks === 1 ? "week" : "weeks"}</div>
        </div>
        <div>
          <div className="eyebrow">total</div>
          <div className="display text-2xl">{progress.total}</div>
        </div>
      </div>
      {progress.nextMilestone && (
        <p className="mt-3 text-xs text-muted">
          {progress.nextMilestone.left === 1 ? "one more" : `${progress.nextMilestone.left} more`} to {progress.nextMilestone.at}.
        </p>
      )}

      <div className="mt-auto pt-12">
        <Link href="/" className="btn block text-center">
          back home
        </Link>
      </div>
    </main>
  );
}
