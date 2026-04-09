/**
 * Parse a time string in "h:mm AM/PM" format into a Date (using today's date).
 */
export function parseTime(str: string): Date {
  const match = str.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return new Date(NaN);
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();
  if (ampm === "PM" && hours !== 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
}

/**
 * Format a Date into "h:mm AM" display format.
 */
export function formatTime(date: Date): string {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}

/**
 * Format a Date into "HH:mm" (24-hour) format for native input[type=time].
 */
export function formatTime24(date: Date): string {
  return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
}

/**
 * Parse a "HH:mm" (24-hour) string into a Date (using today's date).
 */
export function parseTime24(str: string): Date {
  const parts = str.split(":");
  if (parts.length !== 2) return new Date(NaN);
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  if (isNaN(hours) || isNaN(minutes)) return new Date(NaN);
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
}

/**
 * Add minutes to a Date, returning a new Date.
 */
export function addMinutes(date: Date, mins: number): Date {
  return new Date(date.getTime() + mins * 60_000);
}

/**
 * Get the difference in whole minutes between two Dates (truncated toward zero).
 */
export function differenceInMinutes(a: Date, b: Date): number {
  return Math.trunc((a.getTime() - b.getTime()) / 60_000);
}

/**
 * Check if a value is a valid Date.
 */
export function isValidDate(d: unknown): d is Date {
  return d instanceof Date && !isNaN(d.getTime());
}
