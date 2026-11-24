import { AxiosError } from "axios";
import type { CitySuggestion } from "../models/Weather";

export async function getCitySuggestions(city: string, signal: AbortSignal): Promise<CitySuggestion[]> {
  const response = await fetch(`/api/city-suggestions?q=${encodeURIComponent(city)}`, { signal });
  if (!response.ok) return [];

  return response.json();
}

export async function searchCityApi(
  city: string,
  signal?: AbortSignal,
): Promise<unknown> {
  const controller = new AbortController();
  const cancel = () => controller.abort();
  const timer = setTimeout(cancel, 10_000);
  if (signal?.aborted) cancel();
  signal?.addEventListener("abort", cancel, { once: true });

  try {
    let response: Response;
    try {
      response = await fetch(`/api/geocode?q=${encodeURIComponent(city)}`, {
        signal: controller.signal,
      });
    } catch (error) {
      if (controller.signal.aborted) throw error;
      throw new AxiosError("Geocoding connection failed", "ERR_NETWORK");
    }

    if (response.status === 504) throw new AxiosError("Geocoding timed out", "ETIMEDOUT");
    if (response.status === 503) throw new AxiosError("Geocoding connection failed", "ERR_NETWORK");
    if (response.status === 500) {
      throw new AxiosError("Geocoding is unavailable on the server", "GEOCODING_NOT_CONFIGURED");
    }
    if (!response.ok) throw new AxiosError("Geocoding request failed", "ERR_BAD_RESPONSE");

    return await response.json();
  } catch (error) {
    if (controller.signal.aborted && !signal?.aborted) {
      throw new AxiosError("Geocoding timed out", "ETIMEDOUT");
    }
    throw error;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", cancel);
  }
}
