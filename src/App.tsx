import { useState, useEffect, useCallback } from "react";
import QuickSet from "./components/QuickSet";
import ThemeToggle from "./components/ThemeToggle";

import useFaviconBadge from "./utils/useFaviconBadge";
import useHoursSince from "./utils/useHoursSince";
import {
  parseTime,
  parseTime24,
  formatTime,
  formatTime24,
  addMinutes,
  isValidDate,
} from "./utils/timeHelpers";

function toInputValue(display: string | undefined): string {
  if (!display) return "";
  const d = parseTime(display);
  if (!isValidDate(d)) return "";
  return formatTime24(d);
}

function fromInputValue(value: string): string {
  if (!value) return "";
  const d = parseTime24(value);
  if (!isValidDate(d)) return "";
  return formatTime(d);
}

const startTimes: Date[] = [];
for (
  let startTime = parseTime("5:15 AM"), i = 0;
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
