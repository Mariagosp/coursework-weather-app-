import { create } from 'zustand'
import { removeCachedFavoriteWeather, setPersistedFavoriteIds } from '../../../services/favoritesCache'

type FavoritesStore = {
  favoriteCityIds: number[]
  toggleFavorite: (cityId: number) => void
  isFavorite: (cityId: number) => boolean
  setFavoriteCityIds: (ids: number[]) => void
}

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  favoriteCityIds: [],
  toggleFavorite: (cityId) =>
    set((state) => {
      const has = state.favoriteCityIds.includes(cityId)

      const next = has
        ? state.favoriteCityIds.filter((id) => id !== cityId)
        : [...state.favoriteCityIds, cityId]

      setPersistedFavoriteIds(next).catch((e) => { console.warn('Failed to persist favorites', e) })

      if (has) {
        removeCachedFavoriteWeather(cityId).catch(() => { })
      }

      return { favoriteCityIds: next }
    }),
  isFavorite: (cityId) => get().favoriteCityIds.includes(cityId),
  setFavoriteCityIds: (ids) => set({ favoriteCityIds: ids }),
}))
