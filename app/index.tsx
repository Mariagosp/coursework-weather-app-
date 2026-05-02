import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { COLORS } from '../shared/const/colors'
import { useEffect } from 'react'
import { useFavoritesStore } from '../shared/store/useFavoritesStore'
import { useUserStore } from '../shared/store'
import { getPersistedFavoriteIds } from '../services/favoritesCache'

export default function Index() {
  const user = useUserStore((state) => state.user)
  
  console.log('user', user)

    useEffect(() => {
        if (!user) return

        getPersistedFavoriteIds().then((ids) => {
            useFavoritesStore.getState().setFavoriteCityIds(ids)
        })
    }, [user])

    return (
        <View style={styles.container}>
            <ActivityIndicator size='large' color={COLORS.primary} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.main,
        justifyContent: 'center',
        alignItems: 'center'
    }
})
