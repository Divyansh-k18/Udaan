function pad(value) {
  return String(value).padStart(2, "0");
}

export function formatClockTime(totalSeconds = 0) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));

  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  return `${pad(minutes)}:${pad(seconds)}`;
}

export function formatSpokenTime(totalSeconds = 0) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));

  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  const parts = [];

  if (hours > 0) {
    parts.push(`${hours} ${hours === 1 ? "hour" : "hours"}`);
  }

  if (minutes > 0) {
    parts.push(
      `${minutes} ${minutes === 1 ? "minute" : "minutes"}`
    );
  }

  if (seconds > 0 || parts.length === 0) {
    parts.push(
      `${seconds} ${seconds === 1 ? "second" : "seconds"}`
    );
  }

  return parts.join(" ");
}

function Timer({
  seconds = 0,
  label = "Time left",
}) {
  return (
    <div
      className="mock-timer"
      role="timer"
      aria-live="off"
      aria-label={`${label}: ${formatSpokenTime(seconds)}`}
    >
      <span className="mock-timer-label">
        {label}
      </span>

      <strong aria-hidden="true">
        {formatClockTime(seconds)}
      </strong>
    </div>
  );
}

export default Timer;