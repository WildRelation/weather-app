/** Shared app-domain models. API-specific JSON belongs in separate DTOs/parsers. */
export interface Location {
  id: string; // Stable key, e.g. rounded latitude/longitude pair
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
}

export interface CurrentWeather {
  observedAt: string; // ISO-like local time returned by the API
  temperatureC: number;
  weatherCode: number; // WMO code; convert to a label/icon in the UI
  windSpeedKmh: number | null;
}

export interface HourlyForecast {
  time: string;
  temperatureC: number;
  weatherCode: number;
  precipitationMm: number | null;
  windSpeedKmh: number | null;
}

export interface DailyForecast {
  date: string; // YYYY-MM-DD in the selected location's timezone
  minTemperatureC: number;
  maxTemperatureC: number;
  weatherCode: number;
  precipitationSumMm: number | null;
  hours: HourlyForecast[];
}

export interface WeatherForecast {
  location: Location;
  timezone: string;
  fetchedAt: string; // ISO UTC timestamp generated when data was fetched
  current: CurrentWeather;
  days: DailyForecast[]; // Expected: 7 consecutive dates
}

export interface AppSettings {
  refreshIntervalMinutes: 15 | 30 | 60;
  temperatureUnit: 'celsius' | 'fahrenheit';
  theme: 'system' | 'light' | 'dark';
}

export type WeatherErrorCode =
  | 'INVALID_INPUT'
  | 'PLACE_NOT_FOUND'
  | 'OFFLINE'
  | 'TIMEOUT'
  | 'API_ERROR'
  | 'INVALID_RESPONSE'
  | 'UNKNOWN';

export interface WeatherError {
  code: WeatherErrorCode;
  message: string;
}

export type WeatherScreenState =
  | { status: 'idle'; forecast: null; error: null }
  | { status: 'loading'; forecast: WeatherForecast | null; error: null }
  | { status: 'success'; forecast: WeatherForecast; error: null; isStale: boolean }
  | { status: 'error'; forecast: WeatherForecast | null; error: WeatherError };
