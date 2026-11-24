const dayFormatter = new Intl.DateTimeFormat("sv-SE", {
  weekday: "long",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

export function formatForecastDate(date: string) {
  return dayFormatter.format(new Date(date));
}
