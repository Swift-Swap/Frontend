"use client";

import { ThemeProvider } from "next-themes";
import { usePathname } from "next/navigation";
import React from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  return (
    <ThemeProvider
      enableSystem
      forcedTheme={path === "/admin" ? "dark" : undefined}
    >
      {children}
    </ThemeProvider>
  );
}
