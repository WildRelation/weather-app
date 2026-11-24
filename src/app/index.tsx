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
import { useWeather } from "../hooks/useWeather";
import { formatForecastDate } from "../utils/formatForecastDate";

export default function Index() {
  const [cityQuery, setCityQuery] = useState("");
  const { state, requestedCity, searchCity, searchCoordinates, retry } = useWeather();
  const forecast = state.status === "success" ? state.forecast : null;
  const isStale = state.status === "success" && state.isStale;
  const forecastDate = forecast?.current.observedAt.slice(0, 10);
  const today = forecast?.days.find((day) => day.date === forecastDate);
  const hourlyTitle = isStale && today
    ? `Timprognos · ${formatForecastDate(today.date)}`
    : "Timprognos idag";
  const isLoading = state.status === "loading";
  const cityName = cityQuery.trim();
  const canSearch = cityName.length > 0 && !isLoading;

  function submitSearch() {
    if (!canSearch) {
      return;
    }

    Keyboard.dismiss();
    searchCity(cityName);
  }

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right", "bottom"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.searchRow}>
          <TextInput
            accessibilityLabel="Stad"
            placeholder="Sök stad"
            placeholderTextColor="#52687e"
            value={cityQuery}
            onChangeText={setCityQuery}
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
        <CoordinateSearch disabled={isLoading} onSearch={searchCoordinates} />

        {isLoading && (
          <View style={styles.loading}>
            <ActivityIndicator color="#185388" accessible={false} />
            <Text accessibilityRole="alert" style={styles.hint}>
              Laddar väder för {requestedCity}…
            </Text>
          </View>
        )}
        {state.status === "error" && (
          <>
            <Text accessibilityRole="alert" style={styles.message}>
              {state.error.message}
            </Text>
            {state.error.code !== "PLACE_NOT_FOUND" && (
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
            />
            <Text style={styles.hint}>
              Väder från <Link href="https://open-meteo.com/" style={styles.sourceLink}>Open-Meteo</Link>
              {" · Platser från "}<Link href="https://www.geonames.org/" style={styles.sourceLink}>GeoNames</Link>
              {" · "}<Link href="https://creativecommons.org/licenses/by/4.0/" style={styles.sourceLink}>CC BY 4.0</Link>
            </Text>
            <HourlyForecastList title={hourlyTitle} hours={today?.hours ?? []} />
            <ForecastList
              cityName={forecast.location.name}
              days={forecast.days}
              isStale={isStale}
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
