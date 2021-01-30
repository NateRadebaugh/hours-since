import clsx from "clsx";
import { format } from "date-fns";
import { timeFormat } from "../utils/useHoursSince";

import styles from "./QuickSet.module.scss";

export default function QuickSet({ startTimes, sinceTime, setSinceTime }) {
  return (
    <div className={styles.wrapper}>
      {startTimes.map((startTime) => {
        const formatted = format(startTime, timeFormat);
        const isSelected = formatted === sinceTime;

        return (
          <span key={formatted}>
            <button
              type="button"
              className={clsx([
                "btn",
                isSelected ? "btn-primary" : "btn-secondary",
              ])}
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
