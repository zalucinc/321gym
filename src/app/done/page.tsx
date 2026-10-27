"use client";

import dynamic from "next/dynamic";
import { RequireMember } from "@/app/require-member";

const Done = dynamic(() => import("./done"), { ssr: false });

export default function Page() {
  return (
    <RequireMember>
      <Done />
    </RequireMember>
  );
}
