"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { sync } from "@/lib/sync";

/**
 * Every screen except /join needs a signed-in member. The check is local
 * (did this phone ever join), so it works offline; the server still enforces
 * the cookie on every API call.
 */
export function RequireMember({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const ok = typeof window !== "undefined" && sync.getMe() != null;
  useEffect(() => {
    if (!ok) router.replace(`/join${path && path !== "/" ? `?next=${encodeURIComponent(path)}` : ""}`);
  }, [ok, router, path]);
  if (!ok) return null;
  return <>{children}</>;
}
