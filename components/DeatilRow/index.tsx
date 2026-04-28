import { StyleSheet, Text, View } from 'react-native'
import { COLORS } from '../../shared/const/colors';

type Props = { label: string; value: string | number }

export function DetailRow({ label, value }: Props) {
    return (
        <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{label}</Text>
            <Text style={styles.detailValue}>{value}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.glassWhiteSoft
    },
    detailLabel: {
        fontSize: 16,
        color: COLORS.textSecondary
    },
    detailValue: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.text
    }
})
