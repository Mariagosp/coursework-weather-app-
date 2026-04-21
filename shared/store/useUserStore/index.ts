import { signOut, User } from 'firebase/auth'
import { create } from 'zustand'
import { auth } from '../../../firebase'
import { removeAuthToken } from '../../../service/authStorage'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { CACHE_KEYS } from '../../const/cache'

interface UseUserStoreType {
    isLoading: boolean
    user: User | null
    setUserData: (user?: User | null) => void
    logout: () => void
}

export const useUserStore = create<UseUserStoreType>()((set) => ({
    isLoading: true,
    user: null,
    setUserData: (user) => set({ user, isLoading: false }),
    logout: async () => {
        await signOut(auth)
        await removeAuthToken()
        await AsyncStorage.multiRemove([CACHE_KEYS.FAVORITES, CACHE_KEYS.FAVORITES_WEATHER, CACHE_KEYS.HOME_WEATHER])

        set({ user: null })
    }
}))
