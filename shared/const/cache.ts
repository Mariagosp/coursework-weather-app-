import { WeatherApiResponse } from "../../types/weather"

export const CACHE_KEYS = {
  HOME_WEATHER: 'home_location_weather',
  HOME_WEATHER_UPDATED_AT: 'home_location_weather_updated_at',
  FAVORITES: 'favorites',
  FAVORITES_WEATHER: 'favorites_weather',
} as const

export type CachedHomeWeather = {
  data: WeatherApiResponse,
  savedAt: number,
}

export type FavoritesWeatherCache = Record<string, CachedHomeWeather>
