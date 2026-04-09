import DateTime from "@nateradebaugh/react-datetime";
import { format, isDate, isValid, parse, addMinutes } from "date-fns";
import { useState, useEffect, useCallback } from "react";
import QuickSet from "./components/QuickSet";
import ThemeToggle from "./components/ThemeToggle";

import useFaviconBadge from "./utils/useFaviconBadge";
import useHoursSince, { timeFormat } from "./utils/useHoursSince";

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

  const theDate = parse(sinceTime ?? "", timeFormat, new Date());
  const asValue =
    isDate(theDate) && isValid(theDate) && format(theDate, timeFormat) === sinceTime
      ? theDate
      : sinceTime;

  return (
    <>
      <ThemeToggle />
      <div className="App">
        <h1>
          {typeof isPast === "boolean" && messagePrefix}
          <DateTime
            aria-label={messagePrefix}
            dateFormat={false}
            timeFormat={timeFormat}
            onChange={(newValue) => {
              if (!newValue) {
                setSinceTime("");
              } else if (typeof newValue === "number") {
                throw new Error("Not supported");
              } else if (typeof newValue === "string") {
                setSinceTime(newValue);
              } else {
                const asDate = newValue;
                setSinceTime(format(asDate, timeFormat));
              }
            }}
            value={asValue}
          />
        </h1>
        <QuickSet startTimes={startTimes} sinceTime={sinceTime} setSinceTime={setSinceTime} />
      </div>
    </>
  );
}

export default App;
