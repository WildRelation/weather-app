import type { WeatherForecast } from "../models/Weather";
import { isValidCoordinate } from "../utils/parseCoordinate";

type KeyValueStore = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
};

function forecastKey(locationId: string) {
  return `weather-app:forecast:v1:${encodeURIComponent(locationId)}`;
}

function cityKey(cityName: string) {
  const query = cityName.trim().toLocaleLowerCase("sv-SE");
  return `weather-app:forecast-city:v1:${encodeURIComponent(query)}`;
}

function isCachedForecast(value: unknown, locationId: string): value is WeatherForecast {
  if (value === null || typeof value !== "object") {
    return false;
  }

  const { location, timezone, fetchedAt, current, days } = value as Partial<WeatherForecast>;
  return location?.id === locationId
    && typeof location.name === "string"
    && isValidCoordinate(location.latitude, 90)
    && isValidCoordinate(location.longitude, 180)
    && typeof timezone === "string"
    && typeof fetchedAt === "string" && Number.isFinite(Date.parse(fetchedAt))
    && current !== undefined && current !== null
    && typeof current.observedAt === "string"
    && Number.isFinite(current.temperatureC)
    && Number.isFinite(current.weatherCode)
    && Array.isArray(days) && days.length === 7
    && days.every((day) =>
      day
      && typeof day.date === "string" && Number.isFinite(Date.parse(day.date))
      && Number.isFinite(day.minTemperatureC)
      && Number.isFinite(day.maxTemperatureC)
      && Number.isFinite(day.weatherCode)
      && Array.isArray(day.hours)
      && day.hours.every((hour) =>
        hour && typeof hour.time === "string"
        && Number.isFinite(hour.temperatureC)
        && Number.isFinite(hour.weatherCode)
      )
    );
}

export function createWeatherStorage(store: KeyValueStore) {
  let pendingWrite = Promise.resolve();

  async function readByLocation(locationId: string): Promise<WeatherForecast | null> {
    try {
      const json = await store.getItem(forecastKey(locationId));
      if (json === null) return null;

      const forecast: unknown = JSON.parse(json);
      return isCachedForecast(forecast, locationId) ? forecast : null;
    } catch {
      return null;
    }
  }

  async function readByCity(cityName: string): Promise<WeatherForecast | null> {
    try {
      const locationId = await store.getItem(cityKey(cityName));
      return locationId === null ? null : readByLocation(locationId);
    } catch {
      return null;
    }
  }

  function save(forecast: WeatherForecast, cityNames: string[], signal: AbortSignal) {
    pendingWrite = pendingWrite.then(async () => {
      if (signal.aborted) return;

      const { id } = forecast.location;
      await store.setItem(forecastKey(id), JSON.stringify(forecast));
      for (const cityName of cityNames) {
        if (signal.aborted) break;
        await store.setItem(cityKey(cityName), id);
      }
    }).catch(() => {
      // Storage failures must not hide a live forecast or stop later writes.
    });

    return pendingWrite;
  }

  return { readByLocation, readByCity, save };
}

export type WeatherStorage = ReturnType<typeof createWeatherStorage>;
