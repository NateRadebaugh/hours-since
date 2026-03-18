import { useState, useEffect, useCallback, useRef } from "react";

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

  const updateTheme = useCallback(() => {
    if (sunTimesRef.current) {
      const { sunrise, sunset } = sunTimesRef.current;
      setSunTheme(isDaytime(sunrise, sunset) ? "light" : "dark");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (typeof window === "undefined" || !navigator.geolocation) return;

      try {
        const position = await getPosition();
        const { latitude, longitude } = position.coords;
        const times = await fetchSunTimes(latitude, longitude);
        if (!cancelled && times) {
          sunTimesRef.current = times;
          const { sunrise, sunset } = times;
          setSunTheme(isDaytime(sunrise, sunset) ? "light" : "dark");
        }
      } catch {
        // Geolocation denied or API failed — caller should fall back
      }
    }

    void init();

    // Re-check every 60 seconds to catch sunrise/sunset transitions
    const id = setInterval(() => {
      updateTheme();
    }, 60_000);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [updateTheme]);

  return sunTheme;
}
