import { useState, useEffect, useRef } from "react";

type SunTheme = "light" | "dark";

interface SunTimes {
  sunrise: Date;
  sunset: Date;
}

// Glen Ellyn, Illinois
const LATITUDE = 41.8775;
const LONGITUDE = -88.0673;

function isDaytime(sunrise: Date, sunset: Date): boolean {
  const now = new Date();
  return now >= sunrise && now < sunset;
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
  const [sunTheme, setSunTheme] = useState<SunTheme | null>(null);
  const sunTimesRef = useRef<SunTimes | null>(null);
  const fetchedDateRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    async function fetchAndApply() {
      const times = await fetchSunTimes();
      if (!cancelled && times) {
        sunTimesRef.current = times;
        fetchedDateRef.current = new Date().toDateString();
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
