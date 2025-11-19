import * as React from "react";

const { useEffect, useRef } = React;

function useInterval(callback: () => void, delay: number) {
  const savedCallbackRef = useRef<(() => void) | undefined>(undefined);

  // Remember the latest callback.
  useEffect(() => {
    savedCallbackRef.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallbackRef && savedCallbackRef.current && savedCallbackRef.current();
    }

    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export default useInterval;
