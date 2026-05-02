import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { COLORS } from "../../../shared/const/colors";
import type { WeatherApiResponse } from "../../../types/weather";
import WeatherCard from "../../../components/WeatherCard";
import { useFavoritesStore } from "../../../shared/store";
import { useNetworkStatus } from "../../../shared/hooks";
import {
  fetchSuggestions,
  fetchWeatherByCity,
  fetchWeatherById,
} from "../../../services/weatherService";
import {
  getCachedFavoritesWeather,
  setCachedFavoritesWeatherList,
} from "../../../services/favoritesCache";
import SuggestionsList from "../../../components/SuggestionsList";

export default function SearchPage() {
  const insets = useSafeAreaInsets();
  const isConnected = useNetworkStatus();
  const favoriteCityIds = useFavoritesStore((state) => state.favoriteCityIds);

  const [query, setQuery] = useState("");
  const [weather, setWeather] = useState<WeatherApiResponse | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favoriteWeathers, setFavoriteWeathers] = useState<
    WeatherApiResponse[]
  >([]);

  useEffect(() => {
    if (favoriteCityIds.length === 0) {
      setFavoriteWeathers([]);

      return;
    }

    let cancelled = false;

    getCachedFavoritesWeather(favoriteCityIds).then((cached) => {
      if (cancelled) {
        return;
      }

      if (cached.length > 0) {
        setFavoriteWeathers(cached);
      }
    });

    if (isConnected) {
      Promise.allSettled(
        favoriteCityIds.map((id) => fetchWeatherById(id))
      ).then((results) => {
        if (cancelled) {
          return;
        }

        const list = results
          .filter(
            (r): r is PromiseFulfilledResult<WeatherApiResponse> =>
              r.status === "fulfilled" && r.value != null
          )
          .map((r) => r.value);

        setFavoriteWeathers(list);
        setCachedFavoritesWeatherList(list).catch(() => {});
      });
    }

    return () => {
      cancelled = true;
    };
  }, [favoriteCityIds, isConnected]);

  const search = async () => {
    if (!query.trim()) {
      return;
    }

    if (isConnected === false) {
      alert("No Internet\nCheck your connection and try again");
      return;
    }

    setError(null);
    setWeather(null);
    setLoading(true);

    try {
      const data = await fetchWeatherByCity(query);
      setWeather(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const openDetails = () => {
    if (!weather) {
      return;
    }

    router.push({ pathname: "/weather-details", params: { id: weather.id } });
  };

  const openDetailsForFavorite = (w: WeatherApiResponse) => {
    router.push({ pathname: "/weather-details", params: { id: w.id } });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.keyboardDismissArea}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + 24 },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.searchBlock}>
              <View style={styles.searchRow}>
                <View style={styles.inputWrap}>
                  <Ionicons
                    name="search"
                    size={20}
                    color={COLORS.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="City name (e.g. London, Tokyo)"
                    placeholderTextColor={COLORS.textSecondary}
                    value={query}
                    onChangeText={async (t) => {
                      setQuery(t);
                      setError(null);

                      if (!t.trim()) {
                        setSuggestions([]);
                        return;
                      }

                      const names = await fetchSuggestions(t);
                      setSuggestions(names);
                    }}
                    onSubmitEditing={search}
                    returnKeyType="search"
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                  {query.length > 0 && (
                    <Pressable
                      onPress={() => setQuery("")}
                      hitSlop={8}
                      style={styles.clearBtn}
                    >
                      <Ionicons
                        name="close-circle"
                        size={20}
                        color={COLORS.textSecondary}
                      />
                    </Pressable>
                  )}
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.searchBtn,
                    pressed && styles.searchBtnPressed,
                  ]}
                  onPress={() => {
                    search();
                    Keyboard.dismiss();
                  }}
                  disabled={loading || !query.trim()}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={COLORS.main} />
                  ) : (
                    <Ionicons
                      name="arrow-forward"
                      size={22}
                      color={COLORS.main}
                    />
                  )}
                </Pressable>
              </View>

              {suggestions.length > 0 && (
                <SuggestionsList
                  suggestions={suggestions}
                  handlePress={(city) => {
                    setQuery(city);
                    setSuggestions([]);
                    search();
                    Keyboard.dismiss();
                  }}
                />
              )}
            </View>

            {error && (
              <View style={styles.errorCard}>
                <Ionicons
                  name="warning-outline"
                  size={24}
                  color={COLORS.error}
                />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {!weather && !loading && !error && (
              <View style={styles.placeholder}>
                <View style={styles.placeholderIconWrap}>
                  <Ionicons
                    name="cloud-outline"
                    size={48}
                    color={COLORS.textSecondary}
                  />
                </View>
                <Text style={styles.placeholderTitle}>Search for a city</Text>
                <Text style={styles.placeholderText}>
                  Enter a city name and tap search to see the weather.
                </Text>
              </View>
            )}

            {weather && (
              <WeatherCard
                weather={weather}
                error={null}
                openDetails={openDetails}
              />
            )}

            {favoriteCityIds.length > 0 && (
              <View style={styles.favoritesSection}>
                <Text style={styles.favoritesTitle}>Favorites</Text>
                {favoriteWeathers.length > 0 ? (
                  favoriteWeathers.map((w) => (
                    <View key={w.id} style={styles.favoriteCardWrap}>
                      <WeatherCard
                        weather={w}
                        error={null}
                        openDetails={() => openDetailsForFavorite(w)}
                      />
                    </View>
                  ))
                ) : (
                  <Text style={styles.favoritesEmpty}>
                    Could not load some cities
                  </Text>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.main,
  },
  keyboardDismissArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  searchBlock: {
    position: "relative",
    marginBottom: 24,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.glassWhiteSoft,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.glassWhite,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 14,
  },
  clearBtn: {
    padding: 4,
  },
  searchBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.glassWhite,
  },
  searchBtnPressed: {
    opacity: 0.9,
  },
  errorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(248, 113, 113, 0.1)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.2)",
    marginBottom: 24,
  },
  errorText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.error,
  },
  placeholder: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  placeholderIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.glassWhiteSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
    textAlign: "center",
  },
  placeholderText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
  favoritesSection: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.glassWhite,
  },
  favoritesTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 16,
  },
  favoriteCardWrap: {
    marginBottom: 16,
  },
  favoritesEmpty: {
    fontSize: 15,
    color: COLORS.textSecondary,
    paddingVertical: 8,
  },
});
