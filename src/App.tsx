import * as React from "react";
import { useQueryParam, StringParam } from "use-query-params";

import useHoursSince from "./useHoursSince";

import "./styles.css";

const { useState, useEffect } = React;

function App() {
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

  if (!startQuery) {
    const defaultVal = "6:45 AM";
    setSinceTime(defaultVal);
  } else if (!sinceTime) {
    setRawSinceTime(startQuery);
  }

  const messagePrefix = `${hoursSince} (${hoursMinutesSince}) hours ${relativeWord}`;

  return (
    <div className="App">
      <h1>
        {typeof isPast === "boolean" && messagePrefix}
        <input
          aria-label={messagePrefix}
          onChange={(e) => setSinceTime(e.target.value)}
          value={sinceTime}
        />
      </h1>
    </div>
  );
}

export default App;
