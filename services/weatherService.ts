import apiClient from "../api/apiClient";
import type { WeatherApiResponse } from "../types/weather";
import { memoizeAsync } from "./memoize";

const API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const UNITS = "metric";

function getApiKey(): string {
  if (!API_KEY) {
    throw new Error("EXPO_PUBLIC_OPENWEATHER_API_KEY is not set");
  }

  return API_KEY;
}

function formatErrorMessage(data: { message?: string }): string {
  if (data?.message === "city not found") {
    return "City not found";
  }

  return data?.message || "Failed to load weather";
}

async function fetchWeather(
  params: Record<string, string | number>
): Promise<WeatherApiResponse> {
  const apiKey = getApiKey();

  try {
    const response = await apiClient.get(BASE_URL, {
      params: {
        ...params,
        appid: apiKey,
        units: UNITS,
      },

      authStrategy: "none",
    });

    return response.data as WeatherApiResponse;
  } catch (error: any) {
    throw new Error(formatErrorMessage(error.response?.data || {}));
  }
}

export async function fetchWeatherByCity(
  query: string
): Promise<WeatherApiResponse> {
  return fetchWeather({ q: query.trim() });
}

export async function fetchWeatherByCoords(
  lat: number,
  lon: number
): Promise<WeatherApiResponse> {
  return fetchWeather({ lat, lon });
}

export async function fetchWeatherById(
  cityId: number
): Promise<WeatherApiResponse> {
  return fetchWeather({ id: cityId });
}

async function fetchSuggestionsUncached(
  normalizedQuery: string
): Promise<string[]> {
  try {
    const apiKey = getApiKey();

    const response = await apiClient.get(
      "http://api.openweathermap.org/geo/1.0/direct",
      {
        params: {
          q: normalizedQuery,
          limit: 5,
          appid: apiKey,
        },

        authStrategy: "none",
      }
    );

    return response.data.map(
      (item: { name: string; state?: string; country: string }) =>
        item.state
          ? `${item.name}, ${item.state}, ${item.country}`
          : `${item.name}, ${item.country}`
    );
  } catch {
    return [];
  }
}

const memoizedFetchSuggestions = memoizeAsync(fetchSuggestionsUncached, {
  maxSize: 40,
  eviction: "lru",
  ttlMs: 5 * 60 * 1000,
  serializeArgs: ([q]) => JSON.stringify([(q as string).toLowerCase()]),
});

export async function fetchSuggestions(input: string): Promise<string[]> {
  const q = input.trim();

  if (!q) {
    return [];
  }

  return memoizedFetchSuggestions(q);
}
