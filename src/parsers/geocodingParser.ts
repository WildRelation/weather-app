import type { Location } from "../models/Weather";
import { parseCoordinate } from "../utils/parseCoordinate";

export function parseGeocodingResult(data: unknown): Location | null {
  if (!Array.isArray(data)) {
    throw new Error("Invalid geocoding response");
  }
  if (data.length === 0) return null;

  const result: unknown = data[0];
  if (!result || typeof result !== "object") {
    throw new Error("Invalid location in geocoding response");
  }

  const { lat, lon, name, display_name, osm_type, osm_id, address } =
    result as Record<string, unknown>;
  const latitude = typeof lat === "string" ? parseCoordinate(lat, 90) : null;
  const longitude = typeof lon === "string" ? parseCoordinate(lon, 180) : null;
  const displayName = typeof display_name === "string" ? display_name.split(",")[0].trim() : "";
  const placeName = (typeof name === "string" ? name.trim() : "") || displayName;
  if (!placeName || latitude === null || longitude === null) {
    throw new Error("Invalid location in geocoding response");
  }

  const hasOsmId = (osm_type === "node" || osm_type === "way" || osm_type === "relation")
    && (typeof osm_id === "number" || typeof osm_id === "string")
    && /^[1-9]\d*$/.test(String(osm_id));
  const id = hasOsmId ? `osm:${osm_type}:${osm_id}` : `coordinates:${latitude},${longitude}`;
  const location: Location = { id, name: placeName, latitude, longitude };
  const country = (address as { country?: unknown } | null)?.country;
  if (typeof country === "string") location.country = country;
  return location;
}
