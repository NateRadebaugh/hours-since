import { format, parse, addMinutes, startOfDay, differenceInMinutes } from "date-fns";
import DateTime from "@nateradebaugh/react-datetime";
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

function calculateDuration(start: string, stop?: string): string {
  if (!stop) return "In progress";
  
  const startDate = parse(start, timeFormat, new Date());
  const stopDate = parse(stop, timeFormat, new Date());
  const minutes = differenceInMinutes(stopDate, startDate);
  
  if (minutes < 0) return "Invalid range";
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  return `${hours}:${mins.toString().padStart(2, "0")}`;
}

function getTrackGradient(startMinutes: number, stopMinutes: number, maxMinutes: number): string {
  const trackStartPercent = (startMinutes / maxMinutes) * 100;
  const trackFillPercent = ((stopMinutes - startMinutes) / maxMinutes) * 100;
  
  return `linear-gradient(to right, 
    #e0e0e0 0%, 
    #e0e0e0 ${trackStartPercent}%, 
    #4a90e2 ${trackStartPercent}%, 
    #4a90e2 ${trackStartPercent + trackFillPercent}%, 
    #e0e0e0 ${trackStartPercent + trackFillPercent}%, 
    #e0e0e0 100%)`;
}

export default function TimeRangeSliders({
  timeRanges,
  onRangeChange,
}: TimeRangeSlidersProps) {
  if (timeRanges.length === 0) return null;

  return (
    <div className={styles.container}>
      {timeRanges.map((range, index) => {
        const startMinutes = timeToMinutes(range.start);
        const stopMinutes = range.stop ? timeToMinutes(range.stop) : MINUTES_IN_DAY;

        return (
          <div key={index} className={styles.rangeRow}>
            <div className={styles.rangeHeader}>
              <div className={styles.rangeLabel}>
                Range {index + 1}
              </div>
              <div className={styles.subtotal}>
                Duration: {calculateDuration(range.start, range.stop)}
              </div>
            </div>
            
            <div className={styles.sliderContainer}>
              <div 
                className={styles.sliderTrack}
                style={{
                  background: getTrackGradient(startMinutes, stopMinutes, MINUTES_IN_DAY)
                }}
              >
                <input
                  type="range"
                  min={0}
                  max={MINUTES_IN_DAY}
                  step={1}
                  value={startMinutes}
                  onChange={(e) => {
                    const newTime = minutesToTime(parseInt(e.target.value, 10));
                    onRangeChange(index, "start", newTime);
                  }}
                  className={styles.sliderThumb}
                  data-position="start"
                />
                {range.stop && (
                  <input
                    type="range"
                    min={0}
                    max={MINUTES_IN_DAY}
                    step={1}
                    value={stopMinutes}
                    onChange={(e) => {
                      const newTime = minutesToTime(parseInt(e.target.value, 10));
                      onRangeChange(index, "stop", newTime);
                    }}
                    className={styles.sliderThumb}
                    data-position="stop"
                  />
                )}
              </div>
            </div>

            <div className={styles.timeInputs}>
              <div className={styles.timeInputGroup}>
                <label>Start</label>
                <DateTime
                  dateFormat={false}
                  timeFormat={timeFormat}
                  value={parse(range.start, timeFormat, new Date())}
                  onChange={(newValue) => {
                    if (typeof newValue === "string") {
                      onRangeChange(index, "start", newValue);
                    } else if (newValue instanceof Date) {
                      onRangeChange(index, "start", format(newValue, timeFormat));
                    }
                  }}
                />
              </div>
              {range.stop && (
                <div className={styles.timeInputGroup}>
                  <label>Stop</label>
                  <DateTime
                    dateFormat={false}
                    timeFormat={timeFormat}
                    value={parse(range.stop, timeFormat, new Date())}
                    onChange={(newValue) => {
                      if (typeof newValue === "string") {
                        onRangeChange(index, "stop", newValue);
                      } else if (newValue instanceof Date) {
                        onRangeChange(index, "stop", format(newValue, timeFormat));
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
