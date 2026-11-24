import { createContext, useContext } from "react";
import type { ReactNode } from "react";

import { useWeather } from "../hooks/useWeather";
import { useAppPreferences } from "./AppPreferencesContext";

const WeatherContext = createContext<ReturnType<typeof useWeather> | null>(null);

export function WeatherProvider({ children }: { children: ReactNode }) {
  const { settings } = useAppPreferences();
  const weather = useWeather(settings.refreshIntervalMinutes);

  return <WeatherContext.Provider value={weather}>{children}</WeatherContext.Provider>;
}

export function useWeatherContext() {
  const weather = useContext(WeatherContext);
  if (weather === null) throw new Error("WeatherProvider is missing");
  return weather;
}
