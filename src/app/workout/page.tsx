"use client";

import dynamic from "next/dynamic";
import { RequireMember } from "@/app/require-member";

const Workout = dynamic(() => import("./workout"), { ssr: false });

export default function Page() {
  return (
    <RequireMember>
      <Workout />
    </RequireMember>
  );
}
