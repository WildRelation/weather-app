
import type { OpenMeteoResponse } from "../models/OpenMeteo";
import type {
  CurrentWeather,
  DailyForecast,
  HourlyForecast,
  Location,
  WeatherForecast,
} from "../models/Weather";

function isLocalTimestamp(value: unknown): value is string {
  return typeof value === "string"
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(value)
    && Number.isFinite(Date.parse(`${value}Z`));
}

function hasMatchingSeries(time: unknown, ...series: unknown[]): boolean {
  return Array.isArray(time) && time.length > 0
    && series.every((values) => Array.isArray(values) && values.length === time.length);
}

function numberOrNull(value: number | null): number | null {
  return value !== null && Number.isFinite(value) ? value : null;
}

export function parseWeather(
  data: OpenMeteoResponse,
  location: Location,
  fetchedAt: string
): WeatherForecast {

  const currentData = data?.current;
  if (
    !currentData ||
    typeof data.timezone !== "string" ||
    !isLocalTimestamp(currentData.time) ||
    !Number.isFinite(currentData.temperature_2m) ||
    !Number.isFinite(currentData.weather_code)
  ) {
    throw new Error("Invalid current weather");
  }

  const current: CurrentWeather = {
    observedAt: currentData.time,
    temperatureC: currentData.temperature_2m,
    weatherCode: currentData.weather_code,
    windSpeedKmh: numberOrNull(currentData.wind_speed_10m),
  };

  const hourly = data.hourly;
  if (!hourly || !hasMatchingSeries(
    hourly.time, hourly.temperature_2m, hourly.weather_code, hourly.precipitation, hourly.wind_speed_10m,
  )) {
    throw new Error("Invalid hourly forecast series");
  }

  const hours: HourlyForecast[] = hourly.time.map(
    (time, index) => {
      const temperature = hourly.temperature_2m[index];
      const weatherCode = hourly.weather_code[index];

      if (
        !isLocalTimestamp(time)
        || temperature === null || !Number.isFinite(temperature)
        || weatherCode === null || !Number.isFinite(weatherCode)
      ) {
        throw new Error("Invalid hourly forecast");
      }

      return {
        time,
        temperatureC: temperature,
        weatherCode,
        precipitationMm: numberOrNull(hourly.precipitation[index]),
        windSpeedKmh: numberOrNull(hourly.wind_speed_10m[index]),
      };
    }
  );

  const daily = data.daily;
  if (!daily || !hasMatchingSeries(
    daily.time, daily.temperature_2m_min, daily.temperature_2m_max, daily.weather_code, daily.precipitation_sum,
  ) || daily.time.length !== 7) {
    throw new Error("Invalid seven-day forecast series");
  }

  const days: DailyForecast[] = daily.time.map(
    (date, index) => {
      const minTemp = daily.temperature_2m_min[index];
      const maxTemp = daily.temperature_2m_max[index];
      const weatherCode = daily.weather_code[index];

      if (
        typeof date !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
        !Number.isFinite(Date.parse(date)) ||
        new Date(date).toISOString().slice(0, 10) !== date ||
        (index > 0 && Date.parse(date) - Date.parse(daily.time[index - 1]) !== 86_400_000) ||
        minTemp == null || !Number.isFinite(minTemp) ||
        maxTemp == null || !Number.isFinite(maxTemp) ||
        weatherCode == null || !Number.isFinite(weatherCode)
      ) {
        throw new Error("Invalid daily forecast");
      }

      return {
        date,
        minTemperatureC: minTemp,
        maxTemperatureC: maxTemp,
        weatherCode,
        precipitationSumMm: numberOrNull(daily.precipitation_sum[index]),
        hours: hours.filter((hour) =>
          hour.time.startsWith(date + "T")
        ),
      };
    }
  );

  return {
    location,
    timezone: data.timezone,
    fetchedAt,
    current,
    days,
  };
}
