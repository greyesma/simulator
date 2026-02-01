/**
 * Timestamp parsing and formatting utilities
 */

/**
 * Parse timestamp string to seconds
 * Accepts formats like "2:34", "15:07", "1:23:45"
 *
 * @param timestamp - Timestamp string in MM:SS or HH:MM:SS format
 * @returns Number of seconds, or null if invalid format
 */
export function parseTimestampToSeconds(timestamp: string): number | null {
  const parts = timestamp.split(":").map((p) => parseInt(p, 10));
  if (parts.some((p) => isNaN(p))) return null;

  if (parts.length === 2) {
    // MM:SS format
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  } else if (parts.length === 3) {
    // HH:MM:SS format
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  }
  return null;
}

/**
 * Format seconds to MM:SS or HH:MM:SS format
 *
 * @param totalSeconds - Total number of seconds
 * @returns Formatted timestamp string
 */
export function formatSecondsToTimestamp(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = Math.floor(totalSeconds % 60);

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}
