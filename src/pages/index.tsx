import DateTime from "@nateradebaugh/react-datetime";
import { format, isDate, isValid, parse, addMinutes } from "date-fns";
import Router, { useRouter } from "next/router";
import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import QuickSet from "../components/QuickSet";

import useHoursSince, { timeFormat } from "../utils/useHoursSince";

const startTimes: Date[] = [];
for (
  let startTime = parse("5:15 AM", timeFormat, new Date()), i = 0;
  i < 12;
  startTime = addMinutes(startTime, 15), i++
) {
  startTimes.push(startTime);
}

function useTimeParam() {
  const router = useRouter();
  const time = router.query.start as unknown as string;

  const setVal = useCallback(
    (newVal: string) => {
      Router.push({
        pathname: "/",
        query: { start: newVal },
      });
    },
    [],
  );

  return [time, setVal] as const;
}

function Page() {
  const [sinceTime, setRawSinceTime] = useState<string | undefined>(undefined);
  const [startQuery, setStartQuery] = useTimeParam();
  const { isPast, hoursSince, hoursMinutesSince, relativeWord } =
    useHoursSince(sinceTime);

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

  if (startQuery === undefined) {
    // leave it
  } else if (!sinceTime) {
    setRawSinceTime(startQuery);
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
      <QuickSet
        startTimes={startTimes}
        sinceTime={sinceTime}
        setSinceTime={setSinceTime}
      />
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
