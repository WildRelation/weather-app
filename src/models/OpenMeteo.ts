export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  timezone: string;

  current: {
    time: string;
    temperature_2m: number;
    weather_code: number;
    wind_speed_10m: number | null;
  };

  hourly: {
    time: string[];
    temperature_2m: (number | null)[];
    weather_code: (number | null)[];
    precipitation: (number | null)[];
    wind_speed_10m: (number | null)[];
  };

  daily: {
    time: string[];
    temperature_2m_max: (number | null)[];
    temperature_2m_min: (number | null)[];
    weather_code: (number | null)[];
    precipitation_sum: (number | null)[];
  };
}
