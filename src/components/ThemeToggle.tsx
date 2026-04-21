"use client";

import { getThemeLabel, THEME_OPTIONS } from "@/lib/taskflow";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme, cycleTheme } = useTheme();

  if (compact) {
    return (
      <Button
        type="button"
        onClick={cycleTheme}
        variant="secondary"
        className="min-w-[144px] justify-center"
        suppressHydrationWarning
      >
        {getThemeLabel(theme)}
      </Button>
    );
  }

  return (
    <div className="theme-switch" suppressHydrationWarning>
      {THEME_OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setTheme(option)}
          className={option === theme ? "theme-pill is-active" : "theme-pill"}
        >
          <span>{getThemeLabel(option)}</span>
          <small>
            {option === "ember"
              ? "Merah hitam"
              : "Lotus soft pink"}
          </small>
        </button>
      ))}
    </div>
  );
}
