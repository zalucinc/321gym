"use client";

import dynamic from "next/dynamic";

const Welcome = dynamic(() => import("./welcome"), { ssr: false });

export default function Page() {
  return <Welcome />;
}
