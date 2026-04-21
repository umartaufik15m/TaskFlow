"use client";

import { getThemeLabel, THEME_OPTIONS } from "@/lib/taskflow";
import { useTheme } from "@/components/ThemeProvider";

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme, cycleTheme } = useTheme();

  if (compact) {
    return (
      <button
        type="button"
        onClick={cycleTheme}
        className="btn-secondary min-w-[144px] justify-center"
        suppressHydrationWarning
      >
        {getThemeLabel(theme)}
      </button>
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
              ? "Merah gelap"
              : option === "rose"
              ? "Pink gelap"
              : "Terang halus"}
          </small>
        </button>
      ))}
    </div>
  );
}
