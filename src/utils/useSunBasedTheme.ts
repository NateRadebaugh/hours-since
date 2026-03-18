import { useState, useEffect, useRef } from "react";

type SunTheme = "light" | "dark";

interface SunTimes {
  sunrise: Date;
  sunset: Date;
}

// Glen Ellyn, Illinois
const LATITUDE = 41.8775;
const LONGITUDE = -88.0673;

const CACHE_KEY = "sun-times-cache";

function isDaytime(sunrise: Date, sunset: Date): boolean {
  const now = new Date();
  return now >= sunrise && now < sunset;
}

function getCachedSunTimes(): SunTimes | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const sunrise = new Date(parsed.sunrise);
    const sunset = new Date(parsed.sunset);
    if (isNaN(sunrise.getTime()) || isNaN(sunset.getTime())) return null;
    // Only use cache if it's from today
    if (parsed.date !== new Date().toDateString()) return null;
    return { sunrise, sunset };
  } catch {
    return null;
  }
}

function cacheSunTimes(times: SunTimes): void {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({
        sunrise: times.sunrise.toISOString(),
        sunset: times.sunset.toISOString(),
        date: new Date().toDateString(),
      }),
    );
  } catch {
    // localStorage may be full or unavailable
  }
}

function getInitialTheme(): SunTheme | null {
  const cached = getCachedSunTimes();
  if (cached) {
    return isDaytime(cached.sunrise, cached.sunset) ? "light" : "dark";
  }
  return null;
}

async function fetchSunTimes(): Promise<SunTimes | null> {
  try {
    const res = await fetch(
      `https://api.sunrise-sunset.org/json?lat=${LATITUDE}&lng=${LONGITUDE}&formatted=0`,
    );
    const data = await res.json();
    if (data.status === "OK") {
      return {
        sunrise: new Date(data.results.sunrise),
        sunset: new Date(data.results.sunset),
      };
    }
    return null;
  } catch {
    return null;
  }
}

export default function useSunBasedTheme(): SunTheme | null {
  const [sunTheme, setSunTheme] = useState<SunTheme | null>(getInitialTheme);
  const sunTimesRef = useRef<SunTimes | null>(getCachedSunTimes());
  const fetchedDateRef = useRef<string | null>(
    sunTimesRef.current ? new Date().toDateString() : null,
  );

  useEffect(() => {
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    async function fetchAndApply() {
      const times = await fetchSunTimes();
      if (!cancelled && times) {
        sunTimesRef.current = times;
        fetchedDateRef.current = new Date().toDateString();
        cacheSunTimes(times);
        setSunTheme(isDaytime(times.sunrise, times.sunset) ? "light" : "dark");
      }
    }

    async function init() {
      if (typeof window === "undefined") return;

      try {
        await fetchAndApply();

        if (!cancelled) {
          // Re-check every 60 seconds to catch sunrise/sunset transitions
          // and refetch sun times when the day changes (past midnight)
          intervalId = setInterval(() => {
            const today = new Date().toDateString();
            if (fetchedDateRef.current !== today) {
              void fetchAndApply();
            } else if (sunTimesRef.current) {
              const { sunrise, sunset } = sunTimesRef.current;
              setSunTheme(
                isDaytime(sunrise, sunset) ? "light" : "dark",
              );
            }
          }, 60_000);
        }
      } catch {
        // API failed — caller should fall back
      }
    }

    void init();

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return sunTheme;
}
