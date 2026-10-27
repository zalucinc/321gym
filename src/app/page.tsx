"use client";

import dynamic from "next/dynamic";
import { RequireMember } from "@/app/require-member";

// Client-only: state initialises straight from localStorage, no hydration dance.
const Home = dynamic(() => import("./home"), { ssr: false });

export default function Page() {
  return (
    <RequireMember>
      <Home />
    </RequireMember>
  );
}
