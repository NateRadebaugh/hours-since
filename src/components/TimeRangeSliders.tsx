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
  
  return `${hours}h ${mins}m`;
}

// Generate hour markers for the timeline (every 2 hours)
function getHourMarkers(): { time: string; minutes: number }[] {
  const markers = [];
  for (let hour = 0; hour < 24; hour += 2) {
    const minutes = hour * 60;
    markers.push({
      time: minutesToTime(minutes),
      minutes: minutes
    });
  }
  return markers;
}

export default function TimeRangeSliders({
  timeRanges,
  onRangeChange,
}: TimeRangeSlidersProps) {
  if (timeRanges.length === 0) return null;

  const hourMarkers = getHourMarkers();

  return (
    <div className={styles.container}>
      {timeRanges.map((range, index) => {
        const startMinutes = timeToMinutes(range.start);
        const stopMinutes = range.stop ? timeToMinutes(range.stop) : MINUTES_IN_DAY;
        const startPercent = (startMinutes / MINUTES_IN_DAY) * 100;
        const stopPercent = (stopMinutes / MINUTES_IN_DAY) * 100;

        return (
          <div key={index} className={styles.rangeRow}>
            <div className={styles.rangeHeader}>
              <div className={styles.rangeLabel}>
                Range {index + 1}
              </div>
              <div className={styles.subtotal}>
                {calculateDuration(range.start, range.stop)}
              </div>
            </div>
            
            <div className={styles.timelineContainer}>
              {/* Time labels and input fields at top */}
              <div className={styles.timeLabelsTop}>
                <div className={styles.timeInputGroup}>
                  <span className={styles.timeLabel}>{range.start}</span>
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
                    <span className={styles.timeLabel}>{range.stop}</span>
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

              {/* Timeline track with markers */}
              <div className={styles.timelineTrack}>
                {/* Hour markers (ticks) */}
                {hourMarkers.map((marker) => (
                  <div
                    key={marker.time}
                    className={styles.hourMarker}
                    style={{ left: `${(marker.minutes / MINUTES_IN_DAY) * 100}%` }}
                  >
                    <div className={styles.tickMark}></div>
                  </div>
                ))}

                {/* Base track line */}
                <div className={styles.trackLine}></div>

                {/* Highlighted range section */}
                <div
                  className={styles.rangeHighlight}
                  style={{
                    left: `${startPercent}%`,
                    width: `${stopPercent - startPercent}%`
                  }}
                ></div>

                {/* Slider thumbs */}
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
                  className={styles.sliderInput}
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
                    className={styles.sliderInput}
                    data-position="stop"
                  />
                )}
              </div>

              {/* Hour labels at bottom */}
              <div className={styles.timeLabelsBottom}>
                {hourMarkers.map((marker) => (
                  <div
                    key={marker.time}
                    className={styles.hourLabel}
                    style={{ left: `${(marker.minutes / MINUTES_IN_DAY) * 100}%` }}
                  >
                    {marker.time}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
