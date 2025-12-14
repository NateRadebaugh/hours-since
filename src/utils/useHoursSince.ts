import * as React from "react";
import { differenceInMinutes, parse, format, isDate, isValid } from "date-fns";
import useInterval from "./useInterval";
import type { TimeRange } from "../types/TimeRange";

const { useState, useCallback, useEffect } = React;

const dayFormat = "MM/dd/yyyy";
export const timeFormat = "h:mm a";

export interface HoursSinceDetails {
  isPast: boolean | undefined;
  hoursSince: string | undefined;
  hoursMinutesSince: string | undefined;
  relativeWord: string | undefined;
}

function useHoursSince(timeRanges: TimeRange[]): HoursSinceDetails {
  const [isPast, setIsPast] = useState<boolean | undefined>(undefined);
  const [hoursSince, setHoursSince] = useState<string | undefined>(undefined);
  const [hoursMinutesSince, setHoursMinutesSince] = useState<
    string | undefined
  >(undefined);

  const update = useCallback(() => {
    const nowTime = new Date();

    if (!timeRanges || timeRanges.length === 0) {
      setIsPast(undefined);
      setHoursSince(undefined);
      setHoursMinutesSince(undefined);
      return;
    }

    let totalMinutes = 0;
    let hasInvalidRange = false;

    for (const range of timeRanges) {
      const startDateTime = parse(
        `${format(nowTime, dayFormat)} ${range.start}`,
        `${dayFormat} ${timeFormat}`,
        new Date(),
      );

      if (!isDate(startDateTime) || !isValid(startDateTime)) {
        hasInvalidRange = true;
        break;
      }

      let endDateTime: Date;
      if (range.stop) {
        endDateTime = parse(
          `${format(nowTime, dayFormat)} ${range.stop}`,
          `${dayFormat} ${timeFormat}`,
          new Date(),
        );
        if (!isDate(endDateTime) || !isValid(endDateTime)) {
          hasInvalidRange = true;
          break;
        }
      } else {
        // If no stop time, use current time
        endDateTime = nowTime;
      }

      const minutesBetween = differenceInMinutes(endDateTime, startDateTime);
      totalMinutes += minutesBetween;
    }

    if (hasInvalidRange) {
      setIsPast(undefined);
      setHoursSince(undefined);
      setHoursMinutesSince(undefined);
      return;
    }

    setIsPast(Number.isNaN(totalMinutes) ? undefined : totalMinutes >= 0);
    const absMinutes = Math.abs(totalMinutes);

    const fullHoursBetween = Math.floor(absMinutes / 60);
    const remainingMinutes = absMinutes - fullHoursBetween * 60;

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
  }, [timeRanges]);

  useEffect(() => {
    update();
  }, [update]);

  useInterval(() => {
    update();
  }, 10_000);

  const relativeWord =
    isPast === true ? "after" : isPast === false ? "before" : undefined;

  return { isPast, hoursSince, hoursMinutesSince, relativeWord };
}

export default useHoursSince;
