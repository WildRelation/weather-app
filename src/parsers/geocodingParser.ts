import type { OpenMeteoGeocodingResponse } from "../models/OpenMeteo";
import type { Location } from "../models/Weather";

export function parseGeocodingResult(data: OpenMeteoGeocodingResponse): Location | null {
  if (!data || typeof data !== "object" || (
    data.results !== undefined && !Array.isArray(data.results)
  )) {
    throw new Error("Invalid geocoding response");
  }

  if (!data.results?.length) {
    return null;
  }

  const result = data.results[0];
  if (
    !result ||
    !Number.isInteger(result.id) ||
    typeof result.name !== "string" ||
    !result.name.trim() ||
    !Number.isFinite(result.latitude) ||
    Math.abs(result.latitude) > 90 ||
    !Number.isFinite(result.longitude) ||
    Math.abs(result.longitude) > 180
  ) {
    throw new Error("Invalid location in geocoding response");
  }

  return {
    id: String(result.id),
    name: result.name,
    latitude: result.latitude,
    longitude: result.longitude,
    country: typeof result.country === "string" ? result.country : undefined,
  };
}
