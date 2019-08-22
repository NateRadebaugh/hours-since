import * as React from "react";
import { render } from "react-dom";
import { differenceInMinutes, parse, format, isDate, isValid } from "date-fns";
import { useQueryParam, StringParam } from "use-query-params";

import "./styles.css";

const { useState, useEffect, useRef, useCallback } = React;

function useInterval(callback: () => void, delay: number) {
  const savedCallback = useRef<any>();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback && savedCallback.current && savedCallback.current();
    }

    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

interface HoursSinceProps {
  sinceTime?: string;
}

function HoursSince({ sinceTime }: HoursSinceProps): JSX.Element | null {
  const [isPast, setIsPast] = useState<boolean | undefined>(undefined);
  const [hoursSince, setHoursSince] = useState<string | undefined>(undefined);
  const [hoursMinutesSince, setHoursMinutesSince] = useState<
    string | undefined
  >(undefined);

  const update = useCallback(
    (startDateTime: Date | undefined) => {
      const nowTime = new Date();

      if (!startDateTime || !isDate(startDateTime) || !isValid(startDateTime)) {
        startDateTime = parse(format(nowTime, "MM/DD/YYYY ") + sinceTime);
      }

      let minutesBetween = differenceInMinutes(nowTime, startDateTime);
      setIsPast(Number.isNaN(minutesBetween) ? undefined : minutesBetween >= 0);
      minutesBetween = Math.abs(minutesBetween);

      const fullHoursBetween = Math.floor(minutesBetween / 60);
      const remainingMinutes = minutesBetween - fullHoursBetween * 60;

      const minutes15MinInterval =
        remainingMinutes < 13
          ? 0
          : remainingMinutes < 27
          ? 0.25
          : remainingMinutes < 42
          ? 0.5
          : remainingMinutes < 56
          ? 0.75
          : 1;

      const decimalHoursBetween = `${fullHoursBetween}:${
        remainingMinutes < 10 ? "0" : ""
      }${remainingMinutes}`;
      setHoursMinutesSince(decimalHoursBetween);
      setHoursSince(`${(fullHoursBetween + minutes15MinInterval).toFixed(2)}`);
    },
    [sinceTime]
  );

  useEffect(() => {
    update(sinceTime ? parse(sinceTime) : undefined);
  }, [sinceTime, update]);

  useInterval(() => {
    update(sinceTime ? parse(sinceTime) : undefined);
  }, 10000);

  const relativeWord =
    isPast === true ? "after" : isPast === false ? "since" : undefined;

  // Avoid showing NaN if we don't know
  if (isPast === undefined) {
    document.title = `${sinceTime}`;

    return null;
  }

  document.title = `${hoursSince} (${hoursMinutesSince}) hours ${relativeWord} ${sinceTime}`;

  return (
    <>
      {hoursSince} ({hoursMinutesSince}) hours {relativeWord}
    </>
  );
}

function App() {
  const [sinceTime, setSinceTime] = useState<string | undefined>(undefined);
  const [startQuery, setStartQuery] = useQueryParam("start", StringParam);

  function setTime(newVal: string) {
    setSinceTime(newVal);
    setStartQuery(newVal);
  }

  if (!startQuery) {
    const defaultVal = "6:45 AM";
    setTime(defaultVal);
  } else if (!sinceTime) {
    setSinceTime(startQuery);
  }

  return (
    <div className="App">
      <h1>
        <HoursSince sinceTime={sinceTime} />{" "}
        <input onChange={e => setTime(e.target.value)} value={sinceTime} />
      </h1>
    </div>
  );
}

const rootElement = document.getElementById("root");
render(<App />, rootElement);
