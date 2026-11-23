
import type { OpenMeteoResponse } from "../models/OpenMeteo";

import type {
    CurrentWeather,
    DailyForecast,
    HourlyForecast,
    Location,
    WeatherForecast,
} from "../models/Weather";

export function parseWeather(
  data: OpenMeteoResponse,
  location: Location,
  fetchedAt: string
): WeatherForecast {

  const currentData = data.current;
  if (
    typeof data.timezone !== "string" ||
    !currentData ||
    typeof currentData.time !== "string" ||
    !Number.isFinite(currentData.temperature_2m) ||
    !Number.isFinite(currentData.weather_code)
  ) {
    throw new Error("Invalid current weather");
  }

  const current: CurrentWeather = {
    observedAt: currentData.time,
    temperatureC: currentData.temperature_2m,
    weatherCode: currentData.weather_code,
    windSpeedKmh: currentData.wind_speed_10m,
  };

  // 2. Kontrollera timprognoserna
  const hourly = data.hourly;
  const count = hourly.time.length;

  if (
    hourly.temperature_2m.length !== count ||
    hourly.weather_code.length !== count ||
    hourly.precipitation.length !== count ||
    hourly.wind_speed_10m.length !== count
  ) {
    throw new Error("Ogiltiga timprognoser");
  }

  // 3. Omvandla timprognoser
  const hours: HourlyForecast[] = hourly.time.map(
    (time, index) => {
      const temperature = hourly.temperature_2m[index];
      const weatherCode = hourly.weather_code[index];

      if (temperature == null || weatherCode == null) {
        throw new Error("Timprognosen saknar obligatoriska värden");
      }

      return {
        time,
        temperatureC: temperature,
        weatherCode,
        precipitationMm: hourly.precipitation[index],
        windSpeedKmh: hourly.wind_speed_10m[index],
      };
    }
  );

  // 4. Kontrollera dagsprognoserna
  const daily = data.daily;
  const dayCount = daily.time.length;

  if (
    dayCount !== 7 ||
    daily.temperature_2m_min.length !== dayCount ||
    daily.temperature_2m_max.length !== dayCount ||
    daily.weather_code.length !== dayCount ||
    daily.precipitation_sum.length !== dayCount
  ) {
    throw new Error("Ogiltig 7-dagarsprognos");
  }

  // 5. Omvandla dagsprognoser
  const days: DailyForecast[] = daily.time.map(
    (date, index) => {
      const minTemp = daily.temperature_2m_min[index];
      const maxTemp = daily.temperature_2m_max[index];
      const weatherCode = daily.weather_code[index];

      if (
        typeof date !== "string" ||
        !Number.isFinite(Date.parse(date)) ||
        minTemp == null || !Number.isFinite(minTemp) ||
        maxTemp == null || !Number.isFinite(maxTemp) ||
        weatherCode == null || !Number.isFinite(weatherCode)
      ) {
        throw new Error("Invalid daily forecast");
      }

      return {
        date,
        minTemperatureC: minTemp,
        maxTemperatureC: maxTemp,
        weatherCode,
        precipitationSumMm: daily.precipitation_sum[index],

        // Koppla timmarna till rätt datum
        hours: hours.filter((hour) =>
          hour.time.startsWith(date + "T")
        ),
      };
    }
  );

  // 6. Returnera appens WeatherForecast
  return {
    location,
    timezone: data.timezone,
    fetchedAt,
    current,
    days,
  };
}
