import AsyncStorage from "@react-native-async-storage/async-storage";

import type { AppSettings, Location } from "../models/Weather";

type WeatherSettings = Pick<AppSettings, "refreshIntervalMinutes" | "temperatureUnit">;

export type AppPreferences = {
  favorites: Location[];
  settings: WeatherSettings;
};

export const refreshIntervals = [15, 30, 60] as const;

export const defaultPreferences: AppPreferences = {
  favorites: [],
  settings: { refreshIntervalMinutes: 30, temperatureUnit: "celsius" },
};

const storageKey = "weather-app:preferences";

function isLocation(value: unknown): value is Location {
  if (!value || typeof value !== "object") return false;

  const location = value as Partial<Location>;
  return typeof location.id === "string" && location.id !== ""
    && typeof location.name === "string" && location.name.trim() !== ""
    && typeof location.latitude === "number" && Math.abs(location.latitude) <= 90
    && typeof location.longitude === "number" && Math.abs(location.longitude) <= 180
    && (location.country === undefined || typeof location.country === "string");
}

export async function loadAppPreferences(): Promise<AppPreferences> {
  const json = await AsyncStorage.getItem(storageKey);
  if (json === null) return defaultPreferences;

  const saved: Partial<AppPreferences> | null = JSON.parse(json);
  const interval = saved?.settings?.refreshIntervalMinutes;

  return {
    favorites: Array.isArray(saved?.favorites) ? saved.favorites.filter(isLocation) : [],
    settings: {
      refreshIntervalMinutes: interval === 15 || interval === 30 || interval === 60
        ? interval
        : defaultPreferences.settings.refreshIntervalMinutes,
      temperatureUnit: saved?.settings?.temperatureUnit === "fahrenheit" ? "fahrenheit" : "celsius",
    },
  };
}

export function saveAppPreferences(preferences: AppPreferences) {
  return AsyncStorage.setItem(storageKey, JSON.stringify(preferences));
}
