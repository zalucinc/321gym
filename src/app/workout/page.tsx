"use client";

import dynamic from "next/dynamic";

const Workout = dynamic(() => import("./workout"), { ssr: false });

export default function Page() {
  return <Workout />;
}
