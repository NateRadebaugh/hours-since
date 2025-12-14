import DateTime from "@nateradebaugh/react-datetime";
import { format, isDate, isValid, parse, addMinutes } from "date-fns";
import Router, { useRouter } from "next/router";
import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import clsx from "clsx";
import QuickSet from "../components/QuickSet";
import TimeRangeSliders from "../components/TimeRangeSliders";

import useHoursSince, { timeFormat } from "../utils/useHoursSince";
import type { TimeRange } from "../types/TimeRange";

const startTimes: Date[] = [];
for (
  let startTime = parse("5:15 AM", timeFormat, new Date()), i = 0;
  i < 12;
  startTime = addMinutes(startTime, 15), i++
) {
  startTimes.push(startTime);
}

function useTimeRangesParam() {
  const router = useRouter();
  const rangesQuery = router.query.ranges as unknown as string | undefined;

  const ranges: TimeRange[] = rangesQuery
    ? JSON.parse(decodeURIComponent(rangesQuery))
    : [];

  const setVal = useCallback((newRanges: TimeRange[]) => {
    Router.push({
      pathname: "/",
      query:
        newRanges.length > 0
          ? { ranges: encodeURIComponent(JSON.stringify(newRanges)) }
          : {},
    });
  }, []);

  return [ranges, setVal] as const;
}

function Page() {
  const [sinceTime, setRawSinceTime] = useState<string | undefined>(undefined);
  const [timeRanges, setTimeRanges] = useTimeRangesParam();
  const { isPast, hoursSince, hoursMinutesSince, relativeWord } =
    useHoursSince(timeRanges);

  const isRunning = timeRanges.length > 0 && !timeRanges[timeRanges.length - 1].stop;

  const title =
    isPast === undefined
      ? `${sinceTime ?? ""}`
      : `${hoursSince} (${hoursMinutesSince}) hours ${relativeWord} ${sinceTime}`;
  useEffect(() => {
    document.title = title;
  }, [title]);

  function setSinceTime(newVal: string) {
    setRawSinceTime(newVal);
    // Add new time range with start time
    setTimeRanges([...timeRanges, { start: newVal }]);
  }

  function handlePauseResume() {
    if (isRunning) {
      // Pause: add stop time to current range
      const now = new Date();
      const stopTime = format(now, timeFormat);
      const updatedRanges = [...timeRanges];
      updatedRanges[updatedRanges.length - 1].stop = stopTime;
      setTimeRanges(updatedRanges);
    } else {
      // Resume: add new range with start time
      const now = new Date();
      const startTime = format(now, timeFormat);
      setTimeRanges([...timeRanges, { start: startTime }]);
    }
  }

  function handleReset() {
    setRawSinceTime(undefined);
    setTimeRanges([]);
  }

  function handleRangeChange(index: number, field: "start" | "stop", value: string) {
    const updatedRanges = [...timeRanges];
    if (field === "start") {
      updatedRanges[index].start = value;
    } else {
      updatedRanges[index].stop = value;
    }
    setTimeRanges(updatedRanges);
    // Update sinceTime if it's the first range's start
    if (index === 0 && field === "start") {
      setRawSinceTime(value);
    }
  }

  // Initialize sinceTime from ranges
  if (timeRanges.length > 0 && !sinceTime) {
    setRawSinceTime(timeRanges[0].start);
  } else if (timeRanges.length === 0 && sinceTime) {
    setRawSinceTime(undefined);
  }

  const messagePrefix = `${hoursSince} (${hoursMinutesSince}) hours ${relativeWord}`;

  const theDate = parse(sinceTime ?? "", timeFormat, new Date());
  const asValue =
    isDate(theDate) &&
    isValid(theDate) &&
    format(theDate, timeFormat) === sinceTime
      ? theDate
      : sinceTime;

  return (
    <div className="App">
      <h1>
        {typeof isPast === "boolean" && messagePrefix}
        <DateTime
          aria-label={messagePrefix}
          dateFormat={false}
          timeFormat={timeFormat}
          onChange={(newValue) => {
            if (!newValue) {
              setRawSinceTime("");
              setTimeRanges([]);
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
      {timeRanges.length > 0 && (
        <div>
          <button
            type="button"
            className={clsx("btn", isRunning ? "btn-primary" : "btn-secondary")}
            onClick={handlePauseResume}
          >
            {isRunning ? "Pause" : "Resume"}
          </button>
          <button
            type="button"
            className={clsx("btn", "btn-secondary")}
            onClick={handleReset}
            style={{ marginLeft: "0.5rem" }}
          >
            Reset
          </button>
        </div>
      )}
      <TimeRangeSliders
        timeRanges={timeRanges}
        onRangeChange={handleRangeChange}
      />
      {timeRanges.length === 0 && (
        <QuickSet
          startTimes={startTimes}
          sinceTime={sinceTime}
          setSinceTime={setSinceTime}
        />
      )}
    </div>
  );
}

// Subscribe function that never changes (returns no-op unsubscribe)
const subscribeToNothing = () => () => {};

function useIsClient() {
  return useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false
  );
}

export default function Index() {
  const isClient = useIsClient();

  if (!isClient) {
    return null;
  }

  return <Page />;
}
