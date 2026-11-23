
import axios from "axios";
import type { OpenMeteoResponse } from "../models/OpenMeteo";

const BASE_URL = "https://api.open-meteo.com/v1/forecast";

export async function getWeather(
  latitude: number,
  longitude: number
): Promise<OpenMeteoResponse> {

  const response = await axios.get<OpenMeteoResponse>(
    BASE_URL,
    {
      params: {
        latitude,
        longitude,

        current:
          "temperature_2m,weather_code,wind_speed_10m",

        hourly:
          "temperature_2m,weather_code,precipitation,wind_speed_10m",

        daily:
          "temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum",

        timezone: "Europe/Stockholm",
        forecast_days: 7,

        temperature_unit: "celsius",
        wind_speed_unit: "kmh",
        precipitation_unit: "mm",
      },
      timeout: 10000,
    }
  );

  return response.data;
}
