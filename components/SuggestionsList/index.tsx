import { Ionicons } from '@expo/vector-icons'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { COLORS } from '../../shared/const/colors'

type Props = {
    suggestions: string[]
    handlePress: (city: string) => void
}

export default function SuggestionsList({ suggestions, handlePress }: Props) {
    return (
        <View style={styles.suggestionsContainer}>
            {suggestions.map((city, index) => (
                <Pressable
                    key={`${city}-${index}`}
                    onPress={() => {
                        handlePress(city)
                    }}
                    style={({ pressed }) => [
                        styles.suggestionItem,
                        index < suggestions.length - 1 && styles.suggestionItemBorder,
                        pressed && styles.suggestionItemPressed
                    ]}
                >
                    <Ionicons name='location-outline' size={18} color={COLORS.textSecondary} style={styles.suggestionIcon} />
                    <Text style={styles.suggestionText} numberOfLines={1}>
                        {city}
                    </Text>
                    <Ionicons name='chevron-forward' size={16} color={COLORS.textSecondary} />
                </Pressable>
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    suggestionsContainer: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 64,
        backgroundColor: COLORS.main,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.glassWhite,
        overflow: 'hidden',
        maxHeight: 240,
        zIndex: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 8
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(248, 250, 252, 0.04)'
    },
    suggestionItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.glassWhiteSoft
    },
    suggestionItemPressed: {
        backgroundColor: 'rgba(245, 158, 11, 0.12)'
    },
    suggestionIcon: {
        marginRight: 12
    },
    suggestionText: {
        flex: 1,
        fontSize: 16,
        color: COLORS.text,
        fontWeight: '500'
    }
})
