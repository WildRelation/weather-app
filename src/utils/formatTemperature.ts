import type { AppSettings } from "../models/Weather";

const temperatureFormatter = new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 1 });

export function formatTemperature(celsius: number, unit: AppSettings["temperatureUnit"]) {
  if (unit === "fahrenheit") {
    return `${temperatureFormatter.format(celsius * 9 / 5 + 32)}°F`;
  }
  return `${temperatureFormatter.format(celsius)}°C`;
}
