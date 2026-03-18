import { useState, useEffect, useRef } from "react";

type SunTheme = "light" | "dark";

interface SunTimes {
  sunrise: Date;
  sunset: Date;
}

function isDaytime(sunrise: Date, sunset: Date): boolean {
  const now = new Date();
  return now >= sunrise && now < sunset;
}

async function fetchSunTimes(
  lat: number,
  lng: number,
): Promise<SunTimes | null> {
  try {
    const res = await fetch(
      `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0`,
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

function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 10000,
    });
  });
}

export default function useSunBasedTheme(): SunTheme | null {
  const [sunTheme, setSunTheme] = useState<SunTheme | null>(null);
  const sunTimesRef = useRef<SunTimes | null>(null);
  const coordsRef = useRef<{ lat: number; lng: number } | null>(null);
  const fetchedDateRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    async function fetchAndApply() {
      if (!coordsRef.current) return;
      const { lat, lng } = coordsRef.current;
      const times = await fetchSunTimes(lat, lng);
      if (!cancelled && times) {
        sunTimesRef.current = times;
        fetchedDateRef.current = new Date().toDateString();
        setSunTheme(isDaytime(times.sunrise, times.sunset) ? "light" : "dark");
      }
    }

    async function init() {
      if (typeof window === "undefined" || !navigator.geolocation) return;

      try {
        const position = await getPosition();
        coordsRef.current = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
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
        // Geolocation denied or API failed — caller should fall back
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
