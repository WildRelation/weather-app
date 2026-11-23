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

import { ForecastList } from "../components/ForecastList";
import { WeatherCard } from "../components/WeatherCard";
import { mockWeather } from "../data/mockWeather";
import type { WeatherForecast } from "../models/Weather";

export default function Index() {
  const [cityQuery, setCityQuery] = useState("");
  const [forecast, setForecast] = useState<WeatherForecast | null>(mockWeather);
  const [isLoading, setIsLoading] = useState(false);
  const cityName = cityQuery.trim();
  const canSearch = cityName.length > 0 && !isLoading;

  async function searchCity() {
    if (!canSearch) {
      return;
    }

    Keyboard.dismiss();
    setIsLoading(true);

    // Simulate loading so it can be tested with local data.
    await new Promise<void>((resolve) => setTimeout(resolve, 600));

    if (cityName.toLowerCase() === mockWeather.location.name.toLowerCase()) {
      setForecast(mockWeather);
    } else {
      setForecast(null);
    }

    setIsLoading(false);
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
            onSubmitEditing={searchCity}
            editable={!isLoading}
            autoCorrect={false}
            returnKeyType="search"
            style={styles.input}
          />
          <Pressable
            accessibilityRole="button"
            disabled={!canSearch}
            onPress={searchCity}
            style={[styles.searchButton, !canSearch && styles.disabledButton]}
          >
            <Text style={styles.buttonText}>Sök</Text>
          </Pressable>
        </View>
        <Text style={styles.hint}>Testdata för Stockholm</Text>

        {isLoading && (
          <View style={styles.loading}>
            <ActivityIndicator color="#185388" accessible={false} />
            <Text accessibilityRole="alert" style={styles.hint}>
              Laddar väder för {cityName}…
            </Text>
          </View>
        )}
        {!isLoading && forecast === null && (
          <Text accessibilityRole="alert" style={styles.message}>
            Ingen testprognos hittades. Prova Stockholm.
          </Text>
        )}
        {!isLoading && forecast && (
          <>
            <WeatherCard
              cityName={forecast.location.name}
              temperatureC={forecast.current.temperatureC}
              weatherCode={forecast.current.weatherCode}
            />
            <ForecastList days={forecast.days} />
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
