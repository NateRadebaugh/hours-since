import { useState, useEffect, useCallback } from "react";
import styles from "./ThemeToggle.module.css";

type Theme = "light" | "dark";

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
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

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const stored = getStoredTheme();
    if (stored) {
      setTheme(stored);
      applyTheme(stored);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const currentEffective = theme ?? getSystemTheme();
    const next: Theme = currentEffective === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
    localStorage.setItem("theme", next);
  }, [theme]);

  const effectiveTheme = theme ?? getSystemTheme();

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggleTheme}
      aria-label={`Switch to ${effectiveTheme === "dark" ? "light" : "dark"} mode`}
      title={`Switch to ${effectiveTheme === "dark" ? "light" : "dark"} mode`}
    >
      {effectiveTheme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
