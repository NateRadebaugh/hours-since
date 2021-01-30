import DateTime from "@nateradebaugh/react-datetime";
import { format, isDate, isValid, parse, addMinutes } from "date-fns";
import { useState, useEffect } from "react";
import { useQueryParam, StringParam } from "use-query-params";
import QuickSet from "../components/QuickSet";

import useHoursSince, { timeFormat } from "../utils/useHoursSince";

const startTimes: Date[] = [];
for (
  let startTime = parse("6:15 AM", timeFormat, new Date()), i = 0;
  i < 8;
  startTime = addMinutes(startTime, 15), i++
) {
  startTimes.push(startTime);
}

function Page() {
  const [sinceTime, setRawSinceTime] = useState<string | undefined>(undefined);
  const [startQuery, setStartQuery] = useQueryParam("start", StringParam);
  const { isPast, hoursSince, hoursMinutesSince, relativeWord } = useHoursSince(
    sinceTime
  );

  const title =
    isPast === undefined
      ? `${sinceTime}`
      : `${hoursSince} (${hoursMinutesSince}) hours ${relativeWord} ${sinceTime}`;
  useEffect(() => {
    document.title = title;
  }, [title]);

  function setSinceTime(newVal: string) {
    setRawSinceTime(newVal);
    setStartQuery(newVal);
  }

  if (startQuery === undefined) {
    const defaultVal = "6:45 AM";
    setSinceTime(defaultVal);
  } else if (!sinceTime) {
    setRawSinceTime(startQuery);
  }

  const messagePrefix = `${hoursSince} (${hoursMinutesSince}) hours ${relativeWord}`;

  const theDate = parse(sinceTime, timeFormat, new Date());
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

export default function Index() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  if (!isInitialized) {
    return null;
  }

  return <Page />;
}
