import { View, ActivityIndicator, StyleSheet } from 'react-native'
import { COLORS } from '../shared/const/colors'
import { useUserStore } from '../shared/store'

export default function Index() {
    const user = useUserStore((state) => state.user)

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
