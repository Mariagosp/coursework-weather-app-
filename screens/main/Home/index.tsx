import * as Linking from "expo-linking";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import WeatherCard from "../../../components/WeatherCard";
import {
    getCachedHomeWeather,
    setCachedHomeWeather,
} from "../../../services/homeWeatherCache";
import { fetchWeatherByCoords } from "../../../services/weatherService";
import { COLORS } from "../../../shared/const/colors";
import { useNetworkStatus } from "../../../shared/hooks";
import type { WeatherApiResponse } from "../../../types/weather";

export default function HomePage() {
  const isConnected = useNetworkStatus();

  const [status, setStatus] = useState<"loading" | "granted" | "denied">(
    "loading"
  );
  const [weather, setWeather] = useState<WeatherApiResponse | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getCachedHomeWeather().then((cached) => {
      if (cancelled || !cached) {
        return;
      }

      setWeather(cached.data);
      setLastUpdatedAt(cached.savedAt);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const requestLocationAndFetch = useCallback(
    async (isRetry = false) => {
      if (isRetry) {
        setRefreshing(true);
      } else {
        setStatus("loading");
      }

      setError(null);

      try {
        if (isConnected === false) {
          return;
        }

        const { status: perm } =
          await Location.requestForegroundPermissionsAsync();
        if (perm !== "granted") {
          setStatus("denied");
          setWeather(null);

          return;
        }

        setStatus("granted");

        const { coords } = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const data = await fetchWeatherByCoords(
          coords.latitude,
          coords.longitude
        );

        setWeather(data);
        setLastUpdatedAt(Date.now());
        await setCachedHomeWeather(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load weather");
      } finally {
        setRefreshing(false);

        if (!isRetry) {
          setStatus((s) => (s === "loading" ? "granted" : s));
        }
      }
    },
    [isConnected]
  );

  const handleRetry = async () => {
    await Linking.openSettings();
  };

  useEffect(() => {
    requestLocationAndFetch();
  }, []);

  const openDetails = () => {
    if (!weather) return;

    router.push({
      pathname: "/weather-details",
      params: {
        id: weather.id,
      },
    });
  };

  if (status === "loading" && !weather) {
    return (
      <View style={[styles.container]}>
        <View style={styles.loadingBlock}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Getting your location...</Text>
        </View>
      </View>
    );
  }

  if (status === "granted" && !weather && !error) {
    return (
      <View style={[styles.container]}>
        <View style={styles.loadingBlock}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading weather...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              requestLocationAndFetch(true);
            }}
            tintColor={COLORS.text}
            colors={[COLORS.text]}
          />
        }
      >
        {status === "denied" && (
          <Pressable
            style={({ pressed }) => [
              styles.deniedCard,
              pressed && styles.deniedCardPressed,
            ]}
            onPress={() => handleRetry()}
          >
            <View style={styles.deniedIconWrap}>
              <Text style={styles.deniedIcon}>📍</Text>
            </View>
            <Text style={styles.deniedTitle}>Location access denied</Text>
            <Text style={styles.deniedText}>
              To show weather for your location, please allow access in the
              settings.
            </Text>
          </Pressable>
        )}

        {status === "granted" && weather && (
          <WeatherCard
            weather={weather}
            openDetails={openDetails}
            error={error}
            lastUpdatedAt={lastUpdatedAt}
          />
        )}

        {status === "granted" && !weather && error && (
          <View style={styles.deniedCard}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable
              style={styles.retryBtn}
              onPress={() => requestLocationAndFetch(true)}
            >
              <Text style={styles.retryBtnText}>Retry</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.main,
  },
  loadingBlock: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: "center",
    paddingTop: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  deniedCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: COLORS.glassWhiteSoft,
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: COLORS.glassWhite,
    alignItems: "center",
  },
  deniedCardPressed: {
    opacity: 0.9,
  },
  deniedIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  deniedIcon: {
    fontSize: 32,
  },
  deniedTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
    textAlign: "center",
  },
  deniedText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  retryBtn: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    alignSelf: "center",
  },
  retryBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.main,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.error,
  },
});
