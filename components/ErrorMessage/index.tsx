import { StyleSheet, Text, View } from 'react-native'
import { COLORS } from '../../shared/const/colors'

type Props = {
    text?: string
}

export default function ErrorMessage({ text }: Props) {
    if (!text || text.length === 0) return null

    return (
        <View style={styles.serverErrorCard}>
            <Text style={styles.serverErrorText}>{text}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    serverErrorCard: {
        backgroundColor: 'rgba(248, 113, 113, 0.12)',
        borderRadius: 12,
        padding: 14,
        borderWidth: 1,
        borderColor: 'rgba(248, 113, 113, 0.25)',
        marginBottom: 4
    },
    serverErrorText: {
        fontSize: 14,
        color: COLORS.error,
        textAlign: 'center'
    }
})
