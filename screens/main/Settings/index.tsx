import { useState } from 'react'
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useUserStore } from '../../../shared/store'
import { COLORS } from '../../../shared/const/colors'

export default function SettingsPage() {
    const insets = useSafeAreaInsets()
    const logout = useUserStore((s) => s.logout)
    const [loggingOut, setLoggingOut] = useState(false)

    const handleLogout = async () => {
        setLoggingOut(true)
        try {
            await logout()
        } catch {
            alert('Failed to logout. Please try again.')
        } finally {
            setLoggingOut(false)
        }
    }

    return (
        <View style={styles.container}>
            <View style={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account</Text>
                    <Pressable
                        style={({ pressed }) => [styles.logoutBtn, pressed && styles.logoutBtnPressed]}
                        onPress={handleLogout}
                        disabled={loggingOut}
                    >
                        {loggingOut ? (
                            <ActivityIndicator size='small' color={COLORS.main} />
                        ) : (
                            <>
                                <Ionicons name='log-out-outline' size={22} color={COLORS.main} style={styles.logoutIcon} />
                                <Text style={styles.logoutText}>Log out</Text>
                            </>
                        )}
                    </Pressable>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.main
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 24
    },
    section: {
        marginBottom: 24
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.textSecondary,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderWidth: 1,
        borderColor: COLORS.glassWhite
    },
    logoutBtnPressed: {
        opacity: 0.9
    },
    logoutIcon: {
        marginRight: 10
    },
    logoutText: {
        fontSize: 17,
        fontWeight: '600',
        color: COLORS.main
    }
})
