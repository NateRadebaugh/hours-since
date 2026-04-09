import { format, parse, addMinutes } from "date-fns";
import { useState, useEffect, useCallback } from "react";
import QuickSet from "./components/QuickSet";
import ThemeToggle from "./components/ThemeToggle";

import useFaviconBadge from "./utils/useFaviconBadge";
import useHoursSince, { timeFormat } from "./utils/useHoursSince";

/**
 * Convert display format "h:mm a" (e.g. "5:15 AM") to HTML time input value "HH:mm" (e.g. "05:15").
 */
function toInputValue(display: string | undefined): string {
  if (!display) return "";
  const d = parse(display, timeFormat, new Date());
  if (Number.isNaN(d.getTime())) return "";
  return format(d, "HH:mm");
}

/**
 * Convert HTML time input value "HH:mm" (e.g. "05:15") to display format "h:mm a" (e.g. "5:15 AM").
 */
function fromInputValue(value: string): string {
  if (!value) return "";
  const d = parse(value, "HH:mm", new Date());
  if (Number.isNaN(d.getTime())) return "";
  return format(d, timeFormat);
}

const startTimes: Date[] = [];
for (
  let startTime = parse("5:15 AM", timeFormat, new Date()), i = 0;
  i < 12;
  startTime = addMinutes(startTime, 15), i++
) {
  startTimes.push(startTime);
}

function useTimeParam() {
  const getParam = () => new URLSearchParams(window.location.search).get("start") ?? undefined;

  const [time, setTime] = useState<string | undefined>(getParam);

  useEffect(() => {
    const onPop = () => setTime(getParam());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const setVal = useCallback(
    (newVal: string) => {
      const url = new URL(window.location.href);
      url.searchParams.set("start", newVal);
      window.history.pushState({}, "", url);
      setTime(newVal);
    },
    [setTime],
  );

  return [time, setVal] as const;
}

function App() {
  const [sinceTime, setRawSinceTime] = useState<string | undefined>(undefined);
  const [startQuery, setStartQuery] = useTimeParam();
  const { isPast, hoursSince, hoursMinutesSince, relativeWord } = useHoursSince(sinceTime);

  useFaviconBadge(hoursSince);

  const title =
    isPast === undefined
      ? `${sinceTime ?? ""}`
      : `${hoursSince} (${hoursMinutesSince}) hours ${relativeWord} ${sinceTime}`;
  useEffect(() => {
    document.title = title;
  }, [title]);

  function setSinceTime(newVal: string) {
    setRawSinceTime(newVal);
    setStartQuery(newVal);
  }

  useEffect(() => {
    if (startQuery !== undefined && !sinceTime) {
      setRawSinceTime(startQuery);
    }
  }, [startQuery, sinceTime]);

  const messagePrefix =
    typeof isPast === "boolean" ? `${hoursSince} (${hoursMinutesSince}) hours ${relativeWord}` : "";

  return (
    <>
      <ThemeToggle />
      <div className="App">
        <h1>
          {typeof isPast === "boolean" && messagePrefix}
          <input
            type="time"
            aria-label={messagePrefix || "Start time"}
            value={toInputValue(sinceTime)}
            onChange={(e) => {
              const display = fromInputValue(e.target.value);
              setSinceTime(display);
            }}
          />
        </h1>
        <QuickSet startTimes={startTimes} sinceTime={sinceTime} setSinceTime={setSinceTime} />
      </div>
    </>
  );
}

export default App;
