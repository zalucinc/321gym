"use client";

import dynamic from "next/dynamic";

const Done = dynamic(() => import("./done"), { ssr: false });

export default function Page() {
  return <Done />;
}
