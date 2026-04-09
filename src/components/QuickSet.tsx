import { formatTime } from "../utils/timeHelpers";

import styles from "./QuickSet.module.css";

interface QuickSetProps {
  startTimes: Date[];
  sinceTime: string | undefined;
  setSinceTime: (newVal: string) => void;
}

export default function QuickSet({ startTimes, sinceTime, setSinceTime }: QuickSetProps) {
  return (
    <div className={`${styles.wrapper}${!sinceTime ? ` ${styles.empty}` : ""}`}>
      {startTimes.map((startTime) => {
        const formatted = formatTime(startTime);
        const isSelected = formatted === sinceTime;

        return (
          <span key={formatted}>
            <button
              type="button"
              className={`btn ${isSelected ? "btn-primary" : "btn-secondary"}`}
              disabled={isSelected}
              onClick={() => setSinceTime(formatted)}
            >
              {formatted}
            </button>
          </span>
        );
      })}
    </div>
  );
}
