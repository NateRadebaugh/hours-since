import { useState, useEffect, useCallback } from "react";
import styles from "./ThemeToggle.module.scss";
import useSunBasedTheme from "../utils/useSunBasedTheme";

type Theme = "light" | "dark";
type ThemePreference = "light" | "dark" | "auto";

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getStoredTheme(): ThemePreference | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark" || stored === "auto")
    return stored;
  return null;
}

function applyTheme(theme: Theme | null) {
  if (typeof document === "undefined") return;
  if (theme) {
    document.documentElement.setAttribute("data-theme", theme);
  } else {
    document.documentElement.removeAttribute("data-theme");
  }
}

const nextPreference: Record<ThemePreference, ThemePreference> = {
  light: "dark",
  dark: "auto",
  auto: "light",
};

const labels: Record<ThemePreference, string> = {
  light: "light",
  dark: "dark",
  auto: "auto (sunrise/sunset)",
};

const icons: Record<ThemePreference, string> = {
  light: "☀️",
  dark: "🌙",
  auto: "🌓",
};

export default function ThemeToggle() {
  const [preference, setPreference] = useState<ThemePreference | null>(null);
  const sunTheme = useSunBasedTheme();

  // On mount, restore stored preference and apply theme
  useEffect(() => {
    const stored = getStoredTheme();
    if (stored) {
      setPreference(stored);
    }
  }, []);

  // Apply the effective theme whenever preference or sun-based theme changes
  useEffect(() => {
    if (preference === "auto") {
      // When auto, use sun-based theme if available, otherwise fall back to system
      applyTheme(sunTheme ?? getSystemTheme());
    } else if (preference) {
      applyTheme(preference);
    } else {
      applyTheme(null);
    }
  }, [preference, sunTheme]);

  const toggleTheme = useCallback(() => {
    const current: ThemePreference =
      preference ?? (getSystemTheme() === "dark" ? "dark" : "light");
    const next = nextPreference[current];
    setPreference(next);
    localStorage.setItem("theme", next);
  }, [preference]);

  // Resolve the effective visual theme for display
  let effectiveTheme: Theme;
  if (preference === "auto") {
    effectiveTheme = sunTheme ?? getSystemTheme();
  } else {
    effectiveTheme = preference ?? getSystemTheme();
  }

  // Determine what icon and label to show based on the preference mode
  const currentMode: ThemePreference =
    preference ?? (effectiveTheme === "dark" ? "dark" : "light");
  const nextMode = nextPreference[currentMode];

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggleTheme}
      aria-label={`Switch to ${labels[nextMode]} mode`}
      title={`Current: ${labels[currentMode]} mode. Click for ${labels[nextMode]}`}
    >
      {icons[currentMode]}
    </button>
  );
}
