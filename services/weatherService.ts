import apiClient from "../api/apiClient";
import type { WeatherApiResponse } from "../types/weather";
import { log } from "./logger";
import { memoizeAsync } from "./memoize";
import { weatherEvents } from "./weatherEvents";

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

    weatherEvents.emit("weatherLoaded", response.data);

    return response.data as WeatherApiResponse;
  } catch (error: any) {
    weatherEvents.emit("weatherError", error);

    throw new Error(formatErrorMessage(error.response?.data || {}));
  }
}

const fetchWeatherByCityBase = async (query: string) => {
  return fetchWeather({ q: query.trim() });
};

export const fetchWeatherByCity = log({
  level: "INFO",
  json: true,
})(fetchWeatherByCityBase);

export async function fetchWeatherByCoordsBase(
  lat: number,
  lon: number
): Promise<WeatherApiResponse> {
  return fetchWeather({ lat, lon });
}

export const fetchWeatherByCoords = log({
  level: "ERROR",
})(async (lat: number, lon: number) => {
  return fetchWeatherByCoordsBase(lat, lon);
});

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

export async function fetchSuggestionsBase(input: string): Promise<string[]> {
  const q = input.trim();

  if (!q) {
    return [];
  }

  return memoizedFetchSuggestions(q);
}

export const fetchSuggestions = log({
  level: "DEBUG",
})(fetchSuggestionsBase);
