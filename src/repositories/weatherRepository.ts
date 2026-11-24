import { isAxiosError } from "axios";

import type { Location, WeatherError, WeatherScreenState } from "../models/Weather";
import { parseGeocodingResult } from "../parsers/geocodingParser";
import { parseWeather } from "../parsers/weatherParser";
import { searchCityApi } from "../services/searchCityApi";
import { getWeather } from "../services/weatherApi";
import type { WeatherStorage } from "../storage/weatherStorage";
import { isValidCoordinate } from "../utils/parseCoordinate";

export const defaultLocation: Location = {
  id: "2673730",
  name: "Stockholm",
  latitude: 59.3294,
  longitude: 18.0687,
  country: "Sverige",
};

export type WeatherRequest = { cityName: string | null; searchQuery?: string } | { location: Location };
type WeatherResult = Extract<WeatherScreenState, { status: "success" | "error" }>;

function getWeatherError(error: unknown): WeatherError {
  if (!isAxiosError(error)) {
    return {
      code: "INVALID_RESPONSE",
      message: "Vädertjänsten skickade ett ogiltigt svar. Försök igen.",
    };
  }

  if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
    return { code: "TIMEOUT", message: "Anropet tog för lång tid. Försök igen." };
  }

  if (error.code === "ERR_NETWORK") {
    return {
      code: "OFFLINE",
      message: "Kunde inte ansluta. Kontrollera din internetanslutning och försök igen.",
    };
  }

  if (error.code === "GEOCODING_NOT_CONFIGURED") {
    return {
      code: "API_ERROR",
      message: "Platssökningen på servern är inte tillgänglig. Prova att ange koordinater.",
    };
  }

  return { code: "API_ERROR", message: "Vädertjänsten kunde inte hämta data. Försök igen." };
}

export async function loadWeather(
  request: WeatherRequest,
  storage: WeatherStorage,
  signal: AbortSignal,
): Promise<WeatherResult | null> {
  if (signal.aborted) return null;

  const cityName = "cityName" in request ? request.cityName?.trim() ?? null : null;
  const searchQuery = "cityName" in request ? request.searchQuery ?? cityName : null;
  let location = "location" in request ? request.location : null;

  if (cityName === "") {
    return {
      status: "error",
      forecast: null,
      error: { code: "INVALID_INPUT", message: "Ange ett platsnamn." },
    };
  }

  try {
    if ("cityName" in request) {
      location = searchQuery === null
        ? defaultLocation
        : parseGeocodingResult(await searchCityApi(searchQuery, signal));
      if (location && cityName !== null && request.searchQuery !== undefined) {
        location = { ...location, name: cityName };
      }
    }

    if (signal.aborted) return null;

    if (location === null) {
      return {
        status: "error",
        forecast: null,
        error: { code: "PLACE_NOT_FOUND", message: `Hittade ingen plats för ”${cityName}”.` },
      };
    }

    if (!isValidCoordinate(location.latitude, 90) || !isValidCoordinate(location.longitude, 180)) {
      return {
        status: "error",
        forecast: null,
        error: { code: "INVALID_INPUT", message: "Ange giltiga koordinater." },
      };
    }

    const data = await getWeather(location.latitude, location.longitude, signal);
    if (signal.aborted) return null;

    const forecast = parseWeather(data, location, new Date().toISOString());
    const aliases = "location" in request ? [] : [searchQuery ?? defaultLocation.name];
    if (cityName !== null && searchQuery !== cityName) aliases.push(cityName);
    await storage.save(forecast, aliases, signal);
    if (signal.aborted) return null;
    return { status: "success", forecast, error: null, isStale: false };
  } catch (failure) {
    if (signal.aborted) return null;

    const error = getWeatherError(failure);
    if (error.code === "OFFLINE" || error.code === "TIMEOUT") {
      const saved = location !== null
        ? await storage.readByLocation(location.id)
        : await storage.readByCity(searchQuery ?? defaultLocation.name);
      if (signal.aborted) return null;
      if (saved !== null) {
        return { status: "success", forecast: saved, error, isStale: true };
      }
    }

    return { status: "error", forecast: null, error };
  }
}
