import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { useEffect, useState, useCallback } from 'react'
import { WeatherApiResponse } from '../../../types/weather'
import { fetchWeatherById } from '../../../services/weatherService'
import { COLORS } from '../../../shared/const/colors'
import StarBtn from '../../../components/StarBtn'
import { ICON_BASE } from '../../../shared/const/api'
import { getCachedFavoritesWeather } from '../../../services/favoritesCache'
import { getCachedHomeWeather } from '../../../services/homeWeatherCache'
import { formatTime } from './utils/formatTime'
import { DetailRow } from '../../../components/DeatilRow'

export default function WeatherDetailsScreen() {
  const insets = useSafeAreaInsets()
  const params = useLocalSearchParams()
  const id = params.id as string | undefined

  const [currentWeather, setCurrentWeather] = useState<WeatherApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const getWeatherById = useCallback(async (cityId: number) => {
    setLoading(true)
    setError(null)

    try {
      const weather = await fetchWeatherById(cityId)
      setCurrentWeather(weather ?? null)
    } catch (e) {
      const cachedFavorites = await getCachedFavoritesWeather([cityId])

      if (cachedFavorites.length > 0) {
        setCurrentWeather(cachedFavorites[0])
        setError(null)
      } else {
        const cachedHome = await getCachedHomeWeather()

        if (cachedHome?.data?.id === cityId) {
          setCurrentWeather(cachedHome.data)
          setError(null)
        } else {
          setError(e instanceof Error ? e.message : 'Something went wrong')
        }
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (id == null || id === '') return

    const numericId = Number(id)

    if (!isNaN(numericId)) {
      getWeatherById(numericId)
    } else {
      setLoading(false)
    }
  }, [id, getWeatherById])

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size='large' color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading weather...</Text>
      </View>
    )
  }

  if (error || !currentWeather) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.noData}>{error ?? 'No weather data'}</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backHint}>
            Back
          </Text>
        </Pressable>
      </View>
    )
  }

  const w = currentWeather.weather[0]
  const m = currentWeather.main

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.title}>
            ← Back
          </Text>
        </Pressable>
        <View style={styles.headerRow}>
          <Text style={styles.city}>
            {currentWeather.name}, {currentWeather.sys.country}
          </Text>
          <StarBtn id={currentWeather.id} weather={currentWeather} />
        </View>
      </View>

      <View style={styles.hero}>
        <Image source={{ uri: `${ICON_BASE}/${w.icon}@2x.png` }} style={styles.bigIcon} />
        <Text style={styles.mainDesc}>{w.description}</Text>
        <Text style={styles.temp}>{Math.round(m.temp)}°</Text>
        <Text style={styles.feels}>Feels like {Math.round(m.feels_like)}°</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Temperature</Text>
        <DetailRow label='Min' value={`${Math.round(m.temp_min)}°`} />
        <DetailRow label='Max' value={`${Math.round(m.temp_max)}°`} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Atmosphere</Text>
        <DetailRow label='Pressure' value={`${m.pressure} hPa`} />
        <DetailRow label='Humidity' value={`${m.humidity}%`} />
        <DetailRow label='Visibility' value={`${(currentWeather.visibility / 1000).toFixed(1)} km`} />
        <DetailRow label='Cloudiness' value={`${currentWeather.clouds.all}%`} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Wind</Text>
        <DetailRow label='Speed' value={`${currentWeather.wind.speed} m/s`} />
        <DetailRow label='Direction' value={`${currentWeather.wind.deg}°`} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Sun</Text>
        <DetailRow label='Sunrise' value={formatTime(currentWeather.sys.sunrise)} />
        <DetailRow label='Sunset' value={formatTime(currentWeather.sys.sunset)} />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.main
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textSecondary
  },
  scrollContent: {
    paddingHorizontal: 20
  },
  noData: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40
  },
  backHint: {
    color: COLORS.primary,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16
  },
  header: {
    marginBottom: 24
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  title: {
    fontSize: 17,
    color: COLORS.primary,
    marginBottom: 8
  },
  city: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text
  },
  hero: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 24,
    backgroundColor: 'rgba(248, 250, 252, 0.04)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.glassWhiteSoft
  },
  bigIcon: {
    width: 120,
    height: 120,
    marginBottom: 8
  },
  mainDesc: {
    fontSize: 18,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
    marginBottom: 8
  },
  temp: {
    fontSize: 56,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -2
  },
  feels: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 4
  },
  card: {
    backgroundColor: COLORS.glassWhiteSoft,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.glassWhiteSoft
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16
  }
})
