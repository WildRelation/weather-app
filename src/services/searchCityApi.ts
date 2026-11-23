import axios from "axios";
import type { OpenMeteoGeocodingResponse } from "../models/OpenMeteo";

const BASE_URL = "https://geocoding-api.open-meteo.com/v1/search";

export async function searchCityApi(
  city: string,
  signal?: AbortSignal,
): Promise<OpenMeteoGeocodingResponse> {
  const response = await axios.get<OpenMeteoGeocodingResponse>(BASE_URL, {
    params: {
      name: city,
      count: 1,
      language: "sv",
      format: "json",
    },
    signal,
    timeout: 10000,
  });

  return response.data;
}
