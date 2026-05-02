import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { COLORS } from '../../../shared/const/colors'
import {
    demoVirtualDatasetPipeline,
    refreshFavoriteWeatherInStreamedBatches
} from '../../../services/incrementalLargeDataset'
import { useUserStore } from '../../../shared/store'
import { useFavoritesStore } from '../../../shared/store/useFavoritesStore'

export default function SettingsPage() {
    const insets = useSafeAreaInsets()
    const logout = useUserStore((s) => s.logout)
    const favoriteCityIds = useFavoritesStore((s) => s.favoriteCityIds)
    const [loggingOut, setLoggingOut] = useState(false)
    const [streamDemoBusy, setStreamDemoBusy] = useState(false)
    const [favoritesRefreshBusy, setFavoritesRefreshBusy] = useState(false)

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

    const handleStreamDemo = async () => {
        setStreamDemoBusy(true)
        try {
            const VIRTUAL_TOTAL = 50_000
            const BATCH_SIZE = 200
            const { batchesSeen, virtualRecords, checksum } = await demoVirtualDatasetPipeline(
                VIRTUAL_TOTAL,
                BATCH_SIZE
            )
            Alert.alert(
                'Stream demo',
                `Processed ${virtualRecords} virtual IDs in ${batchesSeen} batches (batch size ${BATCH_SIZE}). Checksum mod: ${checksum}. No full array of ${VIRTUAL_TOTAL} items was allocated in the pipeline.`
            )
        } catch (e) {
            Alert.alert('Stream demo', e instanceof Error ? e.message : 'Failed')
        } finally {
            setStreamDemoBusy(false)
        }
    }

    const handleStreamedFavoritesRefresh = async () => {
        if (favoriteCityIds.length === 0) {
            Alert.alert('Favorites', 'Add favorite cities first.')
            return
        }

        setFavoritesRefreshBusy(true)
        try {
            const { batchesProcessed, rowsWritten } = await refreshFavoriteWeatherInStreamedBatches(
                favoriteCityIds,
                4
            )
            Alert.alert(
                'Favorites updated',
                `Fetched weather in ${batchesProcessed} streamed batches; cached ${rowsWritten} cities.`
            )
        } catch (e) {
            Alert.alert('Refresh', e instanceof Error ? e.message : 'Failed')
        } finally {
            setFavoritesRefreshBusy(false)
        }
    }

    return (
        <View style={styles.container}>
            <View style={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Large data (async iterators)</Text>
                    <Text style={styles.hint}>
                        Incremental batches — memory-efficient processing without loading an entire dataset at once.
                    </Text>
                    <Pressable
                        style={({ pressed }) => [styles.secondaryBtn, pressed && styles.secondaryBtnPressed]}
                        onPress={handleStreamDemo}
                        disabled={streamDemoBusy}
                    >
                        {streamDemoBusy ? (
                            <ActivityIndicator color={COLORS.primary} />
                        ) : (
                            <Text style={styles.secondaryBtnText}>Run virtual dataset stream (50k IDs)</Text>
                        )}
                    </Pressable>
                    <Pressable
                        style={({ pressed }) => [
                            styles.secondaryBtn,
                            pressed && styles.secondaryBtnPressed,
                            { marginTop: 10 }
                        ]}
                        onPress={handleStreamedFavoritesRefresh}
                        disabled={favoritesRefreshBusy}
                    >
                        {favoritesRefreshBusy ? (
                            <ActivityIndicator color={COLORS.primary} />
                        ) : (
                            <Text style={styles.secondaryBtnText}>Refresh favorites via streamed batches</Text>
                        )}
                    </Pressable>
                </View>

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
    },
    hint: {
        fontSize: 13,
        color: COLORS.textSecondary,
        lineHeight: 18,
        marginBottom: 14
    },
    secondaryBtn: {
        paddingVertical: 14,
        paddingHorizontal: 18,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: COLORS.glassWhite,
        backgroundColor: COLORS.glassWhiteSoft,
        alignItems: 'center'
    },
    secondaryBtnPressed: {
        opacity: 0.88
    },
    secondaryBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: COLORS.text,
        textAlign: 'center'
    }
})
