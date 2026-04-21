"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_THEME,
  THEME_OPTIONS,
  getThemeLabel,
  type AppTheme,
} from "@/lib/taskflow";

type ThemeContextValue = {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  cycleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  children,
  initialTheme,
}: {
  children: React.ReactNode;
  initialTheme: AppTheme;
}) {
  const [theme, setTheme] = useState<AppTheme>(initialTheme || DEFAULT_THEME);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;

    try {
      localStorage.setItem("taskflow_theme", theme);
    } catch {}

    document.cookie = `taskflow_theme=${theme}; path=/; max-age=31536000; samesite=lax`;
  }, [theme]);

  const value = useMemo<ThemeContextValue>(() => {
    return {
      theme,
      setTheme,
      cycleTheme() {
        const currentIndex = THEME_OPTIONS.indexOf(theme);
        const nextTheme = THEME_OPTIONS[(currentIndex + 1) % THEME_OPTIONS.length];
        setTheme(nextTheme);
      },
    };
  }, [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme harus dipakai di dalam ThemeProvider.");
  }

  return context;
}

export function getThemeSummary(theme: AppTheme) {
  return getThemeLabel(theme);
}
