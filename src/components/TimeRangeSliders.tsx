import { format, parse, addMinutes, startOfDay } from "date-fns";
import { timeFormat } from "../utils/useHoursSince";
import type { TimeRange } from "../types/TimeRange";
import styles from "./TimeRangeSliders.module.scss";

const MINUTES_IN_DAY = 1439; // 23:59 (0-indexed)

interface TimeRangeSlidersProps {
  timeRanges: TimeRange[];
  onRangeChange: (index: number, field: "start" | "stop", value: string) => void;
}

function timeToMinutes(timeStr: string): number {
  const date = parse(timeStr, timeFormat, new Date());
  return date.getHours() * 60 + date.getMinutes();
}

function minutesToTime(minutes: number): string {
  const date = startOfDay(new Date());
  const result = addMinutes(date, minutes);
  return format(result, timeFormat);
}

export default function TimeRangeSliders({
  timeRanges,
  onRangeChange,
}: TimeRangeSlidersProps) {
  if (timeRanges.length === 0) return null;

  return (
    <div className={styles.container}>
      {timeRanges.map((range, index) => (
        <div key={index} className={styles.rangeRow}>
          <div className={styles.rangeLabel}>
            Range {index + 1}:
          </div>
          <div className={styles.sliderGroup}>
            <div className={styles.sliderWrapper}>
              <label>Start</label>
              <input
                type="range"
                min={0}
                max={MINUTES_IN_DAY}
                step={15}
                value={timeToMinutes(range.start)}
                onChange={(e) => {
                  const newTime = minutesToTime(parseInt(e.target.value, 10));
                  onRangeChange(index, "start", newTime);
                }}
                className={styles.slider}
              />
              <span className={styles.timeDisplay}>{range.start}</span>
            </div>
            {range.stop && (
              <div className={styles.sliderWrapper}>
                <label>Stop</label>
                <input
                  type="range"
                  min={0}
                  max={MINUTES_IN_DAY}
                  step={15}
                  value={timeToMinutes(range.stop)}
                  onChange={(e) => {
                    const newTime = minutesToTime(parseInt(e.target.value, 10));
                    onRangeChange(index, "stop", newTime);
                  }}
                  className={styles.slider}
                />
                <span className={styles.timeDisplay}>{range.stop}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
