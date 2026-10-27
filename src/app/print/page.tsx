import { Suspense } from "react";
import { headers } from "next/headers";
import { buildingCodes } from "@/lib/auth";

// Printable poster for the gym wall: /print?code=321WYTHE
// Server-rendered so the QR works without JS and prints cleanly. The dynamic
// part (query + headers) sits inside Suspense, as cache-components mode requires.

export default function PrintPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  return (
    <Suspense fallback={null}>
      <Poster searchParams={searchParams} />
    </Suspense>
  );
}

async function Poster({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code: raw } = await searchParams;
  const code = (raw ?? "").trim().toUpperCase();
  const name = buildingCodes()[code];
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");

  if (!name) {
    return <main className="p-10 text-sm text-muted">add ?code=&lt;building code&gt; to the address.</main>;
  }

  return (
    <main className="poster mx-auto flex min-h-screen max-w-[720px] flex-col items-center justify-center bg-white px-10 py-16 text-center text-[#141110]">
      <style>{`
        @media print { @page { size: letter; margin: 0.6in } body { background: #fff !important } .no-print { display: none } }
        .poster, .poster * { text-transform: lowercase; color-scheme: light; }
      `}</style>
      <p className="text-xs tracking-[0.2em] text-neutral-500">{name}</p>
      <h1 className="display mt-3 text-6xl leading-none">321gym</h1>
      <p className="mt-4 max-w-sm text-lg leading-snug text-neutral-700">
        workouts built from this gym&apos;s equipment. 20 minutes counts.
      </p>

      {/* eslint-disable-next-line @next/next/no-img-element -- generated svg, no optimisation needed */}
      <img src={`${proto}://${host}/api/qr?code=${encodeURIComponent(code)}`} alt={`qr code to join ${name}`} className="mt-10 h-72 w-72" />

      <ol className="mt-10 space-y-2 text-left text-base text-neutral-800">
        <li>1 · scan, or open <span className="font-mono">{host}/join</span></li>
        <li>2 · building code <span className="font-mono font-semibold">{code}</span> · pick a nickname and a 4-digit pin</li>
        <li>3 · tell it how long you have. it builds the session.</li>
      </ol>

      <p className="mt-10 text-xs text-neutral-500">free for residents. on iphone: share → add to home screen.</p>
      <p className="no-print mt-12 text-xs text-neutral-400">⌘p to print · letter, portrait</p>
    </main>
  );
}
