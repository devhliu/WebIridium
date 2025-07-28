const SECONDS_MS = 1_000;
const MINUTES_MS = 60 * SECONDS_MS;
const HOURS_MS = 60 * MINUTES_MS;
const DAYS_MS = 24 * HOURS_MS;

/**
 * @param ms - how many milliseconds (must be greater than 0)
 * @param ignoreSeconds - whether to count seconds in the output
 * @returns string version of the milliseconds (e.g. "5 seconds")
 */
export const millisecondsToText = (
  ms: number,
  { ignoreSeconds = false }: { ignoreSeconds?: boolean } = {},
) => {
  const days = Math.floor(ms / DAYS_MS);
  const hours = Math.floor((ms % DAYS_MS) / HOURS_MS);
  const minutes = Math.floor((ms % HOURS_MS) / MINUTES_MS);
  const seconds = Math.floor((ms % MINUTES_MS) / SECONDS_MS);

  const chunks = [];

  if (days === 1) {
    chunks.push("1 day");
  } else if (days > 0) {
    chunks.push(`${days} days`);
  }

  if (hours === 1) {
    chunks.push("1 hour");
  } else if (hours > 0) {
    chunks.push(`${hours} hours`);
  }

  if (minutes === 1) {
    chunks.push("1 minute");
  } else if (minutes > 0) {
    chunks.push(`${minutes} minutes`);
  }

  if (!ignoreSeconds) {
    if (seconds === 1) {
      chunks.push("1 second");
    } else if (seconds > 0) {
      chunks.push(`${seconds} seconds`);
    }
  }

  if (chunks.length === 0) {
    if (ignoreSeconds) {
      return "1 minute";
    } else {
      return "1 second";
    }
  } else {
    return chunks.join(" ");
  }
};
