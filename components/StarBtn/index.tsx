import { Ionicons } from '@expo/vector-icons'
import { Pressable, StyleSheet } from 'react-native'
import { useFavoritesStore } from '../../shared/store'
import { COLORS } from '../../shared/const/colors'
import { WeatherApiResponse } from '../../types/weather'
import { setCachedFavoriteWeather } from '../../services/favoritesCache'

type Props = {
    id: number
    weather?: WeatherApiResponse
}

export default function StarBtn({ id, weather }: Props) {
    const isFavorite = useFavoritesStore((state) => state.isFavorite(id))
    const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite)

    const onStarPress = async () => {
        if (!isFavorite && weather) {
            await setCachedFavoriteWeather(id, weather).catch(() => {})
        }

        toggleFavorite(id)
    }

    return (
        <>
            <Pressable onPress={onStarPress} hitSlop={12} style={({ pressed }) => [styles.starBtn, pressed && styles.starBtnPressed]}>
                <Ionicons
                    name={isFavorite ? 'star' : 'star-outline'}
                    size={26}
                    color={isFavorite ? COLORS.primary : COLORS.textSecondary}
                />
            </Pressable>
        </>
    )
}

const styles = StyleSheet.create({
    starBtn: {
        padding: 4
    },
    starBtnPressed: {
        opacity: 0.7
    }
})
