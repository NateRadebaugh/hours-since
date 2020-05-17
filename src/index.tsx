import * as React from "react";
import { render } from "react-dom";
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

  return (
    <div className="App">
      <h1>
        {typeof isPast === "boolean" && (
          <>
            {hoursSince} ({hoursMinutesSince}) hours {relativeWord}{" "}
          </>
        )}
        <input
          onChange={(e) => setSinceTime(e.target.value)}
          value={sinceTime}
        />
      </h1>
    </div>
  );
}

const rootElement = document.getElementById("root");
render(<App />, rootElement);
