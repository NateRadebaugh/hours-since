import * as React from "react";
import { render } from "react-dom";
import { differenceInMinutes, parse, format, isDate, isValid } from "date-fns";
import { useQueryParam, StringParam } from "use-query-params";

const { useState, useEffect, useRef } = React;

import "./styles.css";

const useTitle = (title: string) => {
  useEffect(() => {
    document.title = title;
  }, [title]);
};

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

function HoursSince({ sinceTime }: HoursSinceProps): JSX.Element {
  const [hoursSince, setHoursSince] = useState(undefined as string | undefined);
  const [hoursMinutesSince, setHoursMinutesSince] = useState(undefined as
    | string
    | undefined);

  function update(startDateTime: Date | undefined) {
    const nowTime = new Date();

    if (!isDate(startDateTime) || !isValid(startDateTime)) {
      startDateTime = parse(format(nowTime, "MM/DD/YYYY ") + sinceTime);
    }

    const minutesBetween = differenceInMinutes(nowTime, startDateTime);
    const fullHoursBetween = Math.floor(minutesBetween / 60);
    const remainingMinutes = minutesBetween - fullHoursBetween * 60;

    const full6MinIncrements = Math.round(remainingMinutes / 6) * 6;
    const full15MinIncrements =
      (Math.floor((full6MinIncrements - 1) / 15) * 15) % 60;

    const percentPartialHour = full15MinIncrements / 60;

    const decimalHoursBetween = `${fullHoursBetween}:${remainingMinutes}`;
    setHoursMinutesSince(decimalHoursBetween);
    setHoursSince(`${fullHoursBetween + percentPartialHour}`);
  }

  useEffect(() => {
    update(sinceTime ? parse(sinceTime) : undefined);
  }, [sinceTime]);
  useInterval(() => {
    update(sinceTime ? parse(sinceTime) : undefined);
  }, 10000);

  useTitle(`${hoursSince} (${hoursMinutesSince}) hours since ${sinceTime}`);

  return (
    <span>
      {hoursSince} ({hoursMinutesSince}) hours
    </span>
  );
}

function App() {
  const [sinceTime, setSinceTime] = useState(undefined as string | undefined);
  const [startQuery, setStartQuery] = useQueryParam("start", StringParam);

  function setTime(newVal) {
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
        <HoursSince sinceTime={sinceTime} /> since{" "}
        <input onChange={e => setTime(e.target.value)} value={sinceTime} />
      </h1>
    </div>
  );
}

const rootElement = document.getElementById("root");
render(<App />, rootElement);
