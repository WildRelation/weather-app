import { Link } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { CoordinateSearch } from "../components/CoordinateSearch";
import { ForecastList } from "../components/ForecastList";
import { HourlyForecastList } from "../components/HourlyForecastList";
import { SavedForecastNotice } from "../components/SavedForecastNotice";
import { WeatherCard } from "../components/WeatherCard";
import { useAppPreferences } from "../context/AppPreferencesContext";
import { useWeatherContext } from "../context/WeatherContext";
import { useCitySuggestions } from "../hooks/useCitySuggestions";
import type { CitySuggestion } from "../models/Weather";
import { formatForecastDate } from "../utils/formatForecastDate";

type CityInput = { text: string; showSuggestions: boolean; searchQuery?: string };

export default function Index() {
  const [cityInput, setCityInput] = useState<CityInput>({ text: "", showSuggestions: false });
  const { state, requestedCity, searchCity, searchCoordinates, retry } = useWeatherContext();
  const { favorites, settings, isReady, addFavorite, removeFavorite } = useAppPreferences();
  const forecast = state.status === "success" ? state.forecast : null;
  const location = forecast?.location;
  const isFavorite = favorites.some((favorite) => favorite.id === location?.id);
  const isStale = state.status === "success" && state.isStale;
  const forecastDate = forecast?.current.observedAt.slice(0, 10);
  const today = forecast?.days.find((day) => day.date === forecastDate);
  const hourlyTitle = isStale && today
    ? `Timprognos · ${formatForecastDate(today.date)}`
    : "Timprognos idag";
  const isLoading = state.status === "loading";
  const cityName = cityInput.text.trim();
  const canSearch = cityName.length > 0 && !isLoading;
  const suggestions = useCitySuggestions(cityInput.showSuggestions && !isLoading ? cityName : "");

  function submitSearch() {
    if (!canSearch) {
      return;
    }

    setCityInput({ ...cityInput, showSuggestions: false });
    Keyboard.dismiss();
    searchCity(cityName, cityInput.searchQuery);
  }

  function selectSuggestion(suggestion: CitySuggestion) {
    if (isLoading) return;

    setCityInput({ text: suggestion.name, searchQuery: suggestion.query, showSuggestions: false });
    Keyboard.dismiss();
    searchCity(suggestion.name, suggestion.query);
  }

  function submitCoordinates(latitude: number, longitude: number) {
    setCityInput({ ...cityInput, showSuggestions: false });
    searchCoordinates(latitude, longitude);
  }

  function toggleFavorite() {
    if (location === undefined) return;

    if (isFavorite) {
      removeFavorite(location.id);
    } else {
      addFavorite(location);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.navigation}>
          <Link href="/favorites" style={styles.navigationLink}>Favoriter</Link>
          <Link href="/settings" style={styles.navigationLink}>Inställningar</Link>
        </View>
        <View style={styles.searchRow}>
          <TextInput
            accessibilityLabel="Stad"
            placeholder="Sök stad"
            placeholderTextColor="#52687e"
            value={cityInput.text}
            onChangeText={(text) => setCityInput({ text, showSuggestions: true })}
            onSubmitEditing={submitSearch}
            editable={!isLoading}
            autoCorrect={false}
            returnKeyType="search"
            style={styles.input}
          />
          <Pressable
            accessibilityRole="button"
            disabled={!canSearch}
            onPress={submitSearch}
            style={[styles.searchButton, !canSearch && styles.disabledButton]}
          >
            <Text style={styles.buttonText}>Sök</Text>
          </Pressable>
        </View>
        {suggestions.length > 0 && (
          <View style={styles.suggestions}>
            {suggestions.map((suggestion) => (
              <Pressable
                key={suggestion.query}
                accessibilityRole="button"
                accessibilityLabel={[suggestion.name, suggestion.context].filter(Boolean).join(", ")}
                onPress={() => selectSuggestion(suggestion)}
                style={({ pressed }) => [styles.suggestion, pressed && styles.pressedSuggestion]}
              >
                <Text style={styles.suggestionName}>{suggestion.name}</Text>
                {suggestion.context !== "" && (
                  <Text style={styles.hint}>{suggestion.context}</Text>
                )}
              </Pressable>
            ))}
            <Text style={styles.suggestionsSource}>
              Ortsförslag från <Link href="https://www.geonames.org/" style={styles.sourceLink}>GeoNames</Link>
            </Text>
          </View>
        )}
        <CoordinateSearch disabled={isLoading} onSearch={submitCoordinates} />

        {isLoading && (
          <View style={styles.loading}>
            <ActivityIndicator color="#185388" accessible={false} />
            <Text accessibilityRole="alert" style={styles.hint}>
              Laddar väder för {requestedCity}…
            </Text>
          </View>
        )}
        {state.error && (
          <>
            <Text accessibilityRole="alert" style={styles.message}>
              {state.error.message}
            </Text>
            {state.error.code !== "PLACE_NOT_FOUND" && state.error.code !== "INVALID_INPUT" && (
              <Pressable
                accessibilityRole="button"
                onPress={retry}
                style={[styles.searchButton, styles.retryButton]}
              >
                <Text style={styles.buttonText}>Försök igen</Text>
              </Pressable>
            )}
          </>
        )}
        {forecast && (
          <>
            {isStale && <SavedForecastNotice />}
            <WeatherCard
              cityName={forecast.location.name}
              temperatureC={forecast.current.temperatureC}
              weatherCode={forecast.current.weatherCode}
              temperatureUnit={settings.temperatureUnit}
            />
            <Pressable
              accessibilityRole="button"
              onPress={toggleFavorite}
              disabled={!isReady}
              style={[styles.searchButton, styles.retryButton, !isReady && styles.disabledButton]}
            >
              <Text style={styles.buttonText}>
                {isFavorite ? "Ta bort favorit" : "Spara som favorit"}
              </Text>
            </Pressable>
            <Text style={styles.hint}>
              Väder från <Link href="https://open-meteo.com/" style={styles.sourceLink}>Open-Meteo</Link>
              {" ("}<Link href="https://creativecommons.org/licenses/by/4.0/" style={styles.sourceLink}>CC BY 4.0</Link>{")"}
              {" · Platser © "}<Link href="https://www.openstreetmap.org/copyright" style={styles.sourceLink}>OpenStreetMaps bidragsgivare</Link>
            </Text>
            <HourlyForecastList
              title={hourlyTitle}
              hours={today?.hours ?? []}
              temperatureUnit={settings.temperatureUnit}
            />
            <ForecastList
              cityName={forecast.location.name}
              days={forecast.days}
              isStale={isStale}
              temperatureUnit={settings.temperatureUnit}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f0f6fc",
  },
  content: {
    width: "100%",
    maxWidth: 580,
    alignSelf: "center",
    padding: 16,
    gap: 16,
  },
  searchRow: {
    flexDirection: "row",
    gap: 8,
  },
  suggestions: {
    borderWidth: 1,
    borderColor: "#a9bed4",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  suggestion: {
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#a9bed4",
  },
  pressedSuggestion: { backgroundColor: "#d6e8fa" },
  suggestionName: { color: "#122a43", fontSize: 16, fontWeight: "600" },
  suggestionsSource: { color: "#3c5873", fontSize: 12, paddingHorizontal: 12, paddingVertical: 6 },
  navigation: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  navigationLink: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#d6e8fa",
    color: "#122a43",
    fontSize: 16,
    fontWeight: "600",
  },
  input: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#a9bed4",
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#ffffff",
    color: "#122a43",
    fontSize: 16,
  },
  searchButton: {
    minWidth: 56,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#185388",
  },
  retryButton: {
    alignSelf: "flex-start",
  },
  sourceLink: {
    textDecorationLine: "underline",
  },
  disabledButton: {
    backgroundColor: "#52687e",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  hint: {
    color: "#3c5873",
    fontSize: 14,
    flexShrink: 1,
  },
  loading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  message: {
    color: "#8e2828",
    fontSize: 16,
  },
});
