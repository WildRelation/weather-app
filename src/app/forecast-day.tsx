import { Link, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SavedForecastNotice } from "../components/SavedForecastNotice";
import { useAppPreferences } from "../context/AppPreferencesContext";
import { formatForecastDate } from "../utils/formatForecastDate";
import { formatTemperature } from "../utils/formatTemperature";
import { getWeatherCondition } from "../utils/weatherCondition";

type ForecastDayParams = {
  cityName?: string;
  date?: string;
  min?: string;
  max?: string;
  weatherCode?: string;
  precipitation?: string;
  maxWind?: string;
  saved?: string;
};

export default function ForecastDay() {
  const { settings } = useAppPreferences();
  const { cityName, date, min, max, weatherCode, precipitation, maxWind, saved } =
    useLocalSearchParams<ForecastDayParams>();

  const hasForecast = cityName && date && Number.isFinite(Date.parse(date))
    && min && Number.isFinite(Number(min))
    && max && Number.isFinite(Number(max))
    && weatherCode && Number.isFinite(Number(weatherCode));
  const condition = getWeatherCondition(Number(weatherCode));
  const precipitationLabel = precipitation && Number.isFinite(Number(precipitation))
    ? `${precipitation} mm`
    : "Uppgift saknas";
  const windLabel = maxWind && Number.isFinite(Number(maxWind))
    ? `${maxWind} km/h`
    : "Uppgift saknas";

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {hasForecast ? (
          <>
            {saved === "1" && <SavedForecastNotice />}
            <View style={styles.card}>
              <Text accessibilityRole="header" style={styles.city}>{cityName}</Text>
              <Text style={styles.description}>{formatForecastDate(date)}</Text>
              <Text style={styles.condition}>{condition.icon} {condition.label}</Text>
              <Text style={styles.description}>
                Lägsta temperatur: {formatTemperature(Number(min), settings.temperatureUnit)}
              </Text>
              <Text style={styles.description}>
                Högsta temperatur: {formatTemperature(Number(max), settings.temperatureUnit)}
              </Text>
              <Text style={styles.description}>Nederbörd under dagen: {precipitationLabel}</Text>
              <Text style={styles.description}>Högsta vindhastighet: {windLabel}</Text>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.description}>Välj en dag på startsidan för att se prognosen.</Text>
            <Link href="/" style={styles.homeLink}>Till startsidan</Link>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f0f6fc" },
  content: {
    width: "100%",
    maxWidth: 580,
    alignSelf: "center",
    padding: 16,
    gap: 12,
  },
  card: { padding: 20, gap: 8, borderRadius: 16, backgroundColor: "#d6e8fa" },
  city: { fontSize: 26, fontWeight: "700", color: "#122a43" },
  condition: { fontSize: 20, fontWeight: "600", color: "#122a43" },
  description: { fontSize: 16, color: "#294864" },
  homeLink: { fontSize: 16, color: "#185388", textDecorationLine: "underline" },
});
