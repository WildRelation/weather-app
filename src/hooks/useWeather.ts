import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

import type { AppSettings, Location, WeatherScreenState } from "../models/Weather";
import { defaultLocation, loadWeather } from "../repositories/weatherRepository";
import type { WeatherRequest } from "../repositories/weatherRepository";
import { createWeatherStorage } from "../storage/weatherStorage";

const weatherStorage = createWeatherStorage(AsyncStorage);

export function useWeather(refreshIntervalMinutes: AppSettings["refreshIntervalMinutes"]) {
  const [request, setRequest] = useState<WeatherRequest>({ cityName: null });
  const [state, setState] = useState<WeatherScreenState>({
    status: "loading",
    forecast: null,
    error: null,
  });
  const requestedCity = "location" in request
    ? request.location.name
    : request.cityName ?? defaultLocation.name;

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    async function loadForecast() {
      const result = await loadWeather(request, weatherStorage, signal);
      if (!signal.aborted && result !== null) {
        setState(result);
      }
    }

    void loadForecast();
    return () => controller.abort();
  }, [request]);

  useEffect(() => {
    if (state.status === "loading" || state.error?.code === "PLACE_NOT_FOUND"
      || state.error?.code === "INVALID_INPUT") return;

    const timer = setTimeout(() => {
      if (state.status === "success") {
        setRequest({ location: state.forecast.location });
      } else {
        setRequest((current) => ({ ...current }));
      }
    }, refreshIntervalMinutes * 60_000);

    return () => clearTimeout(timer);
  }, [refreshIntervalMinutes, state]);

  function requestForecast(nextRequest: WeatherRequest) {
    setState({ status: "loading", forecast: null, error: null });
    setRequest({ ...nextRequest });
  }

  function searchCoordinates(latitude: number, longitude: number) {
    requestForecast({
      location: {
        id: `coordinates:${latitude},${longitude}`,
        name: `${latitude}, ${longitude}`,
        latitude,
        longitude,
      },
    });
  }

  function searchLocation(location: Location) {
    requestForecast({ location });
  }

  return {
    state,
    requestedCity,
    searchCity: (cityName: string, searchQuery?: string) => requestForecast({ cityName, searchQuery }),
    searchCoordinates,
    searchLocation,
    retry: () => requestForecast(request),
  };
}
