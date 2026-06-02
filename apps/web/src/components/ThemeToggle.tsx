"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme !== "light";
  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="rounded-lg border border-[var(--border)] bg-[var(--panel)] px-3 py-2 text-sm transition-colors hover:bg-[var(--panel-2)]"
    >
      {mounted ? (isDark ? "☀︎ Light" : "☾ Dark") : "…"}
    </button>
  );
}
