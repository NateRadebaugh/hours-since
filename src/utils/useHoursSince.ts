import * as React from "react";
import { differenceInMinutes, parse, format, isDate, isValid } from "date-fns";
import useInterval from "./useInterval";

const { useState, useCallback, useEffect } = React;

const dayFormat = "MM/dd/yyyy";
export const timeFormat = "h:mm a";

export interface HoursSinceDetails {
  isPast: boolean | undefined;
  hoursSince: string | undefined;
  hoursMinutesSince: string | undefined;
  relativeWord: string | undefined;
}

function useHoursSince(sinceTime: string | undefined): HoursSinceDetails {
  const [isPast, setIsPast] = useState<boolean | undefined>(undefined);
  const [hoursSince, setHoursSince] = useState<string | undefined>(undefined);
  const [hoursMinutesSince, setHoursMinutesSince] = useState<
    string | undefined
  >(undefined);

  const update = useCallback(
    (startDateTime: Date | undefined) => {
      const nowTime = new Date();

      if (!startDateTime || !isDate(startDateTime) || !isValid(startDateTime)) {
        startDateTime = parse(
          `${format(nowTime, `${dayFormat}`)} ${sinceTime}`,
          `${dayFormat} ${timeFormat}`,
          new Date()
        );
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
    update(sinceTime ? parse(sinceTime, timeFormat, new Date()) : undefined);
  }, [sinceTime, update]);

  useInterval(() => {
    update(sinceTime ? parse(sinceTime, timeFormat, new Date()) : undefined);
  }, 10_000);

  const relativeWord =
    isPast === true ? "after" : isPast === false ? "before" : undefined;

  return { isPast, hoursSince, hoursMinutesSince, relativeWord };
}

export default useHoursSince;
