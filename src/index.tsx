import * as React from "react";
import { render } from "react-dom";
import { differenceInMinutes, parse, format, isDate, isValid } from "date-fns";
import useInterval from "@use-hooks/interval";
import { useQueryParam, StringParam } from "use-query-params";

const { useState, useEffect } = React;

import "./styles.css";

interface HoursSinceProps {
  sinceTime?: string;
  nowTime?: Date;
}

function HoursSince({
  sinceTime,
  nowTime = new Date()
}: HoursSinceProps): JSX.Element {
  const [hoursSince, setHoursSince] = useState(undefined as string | undefined);

  function update(startDateTime) {
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

    setHoursSince(`${fullHoursBetween + percentPartialHour}`);
  }

  useEffect(
    () => {
      update(sinceTime ? parse(sinceTime) : undefined);
    },
    [sinceTime]
  );
  useInterval(() => {
    update(sinceTime ? parse(sinceTime) : undefined);
  }, 30000);

  return <span>{hoursSince} hours</span>;
}

function App() {
  const [sinceTime, setSinceTime] = useState(undefined as string | undefined);
  const [startQuery, setStartQuery] = useQueryParam("start", StringParam);

  function setTime(newVal) {
    setSinceTime(newVal);
    setStartQuery(newVal);
  }

  if (!sinceTime) {
    const defaultVal = "6:45 AM";
    setTime(defaultVal);
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
