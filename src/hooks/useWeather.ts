import { isAxiosError } from "axios";
import { useEffect, useState } from "react";

import type { Location, WeatherError, WeatherScreenState } from "../models/Weather";
import { parseGeocodingResult } from "../parsers/geocodingParser";
import { parseWeather } from "../parsers/weatherParser";
import { searchCityApi } from "../services/searchCityApi";
import { getWeather } from "../services/weatherApi";

const defaultLocation: Location = {
  id: "2673730",
  name: "Stockholm",
  latitude: 59.3294,
  longitude: 18.0687,
  country: "Sverige",
};

type WeatherRequest = { cityName: string | null } | { location: Location };

function getWeatherError(error: unknown): WeatherError {
  if (!isAxiosError(error)) {
    return {
      code: "INVALID_RESPONSE",
      message: "Vädertjänsten skickade ett ogiltigt svar. Försök igen.",
    };
  }

  if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
    return {
      code: "TIMEOUT",
      message: "Anropet tog för lång tid. Försök igen.",
    };
  }

  if (error.code === "ERR_NETWORK") {
    return {
      code: "OFFLINE",
      message: "Kunde inte ansluta. Kontrollera din internetanslutning och försök igen.",
    };
  }

  return {
    code: "API_ERROR",
    message: "Vädertjänsten kunde inte hämta data. Försök igen.",
  };
}

export function useWeather() {
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
      try {
        let location: Location | null = defaultLocation;
        if ("location" in request) {
          location = request.location;
        } else if (request.cityName !== null) {
          location = parseGeocodingResult(await searchCityApi(request.cityName, signal));
        }

        if (signal.aborted) {
          return;
        }

        if (location === null) {
          setState({
            status: "error",
            forecast: null,
            error: { code: "PLACE_NOT_FOUND", message: `Hittade ingen plats för ”${requestedCity}”.` },
          });
          return;
        }

        const data = await getWeather(location.latitude, location.longitude, signal);
        const forecast = parseWeather(data, location, new Date().toISOString());

        if (!signal.aborted) {
          setState({ status: "success", forecast, error: null, isStale: false });
        }
      } catch (error) {
        if (!signal.aborted) {
          setState({ status: "error", forecast: null, error: getWeatherError(error) });
        }
      }
    }

    void loadForecast();
    return () => controller.abort();
  }, [request, requestedCity]);

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

  return {
    state,
    requestedCity,
    searchCity: (cityName: string) => requestForecast({ cityName }),
    searchCoordinates,
    retry: () => requestForecast(request),
  };
}
