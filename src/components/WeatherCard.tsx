import { StyleSheet, Text, View } from "react-native";

import type { AppSettings } from "../models/Weather";
import { formatTemperature } from "../utils/formatTemperature";
import { getWeatherCondition } from "../utils/weatherCondition";

type WeatherCardProps = {
  cityName: string;
  temperatureC: number;
  weatherCode: number;
  temperatureUnit: AppSettings["temperatureUnit"];
};

export function WeatherCard({ cityName, temperatureC, weatherCode, temperatureUnit }: WeatherCardProps) {
  const condition = getWeatherCondition(weatherCode);

  return (
    <View style={styles.card}>
      <Text accessibilityRole="header" style={styles.city}>{cityName}</Text>
      <Text style={styles.temperature}>{formatTemperature(temperatureC, temperatureUnit)}</Text>
      <Text style={styles.condition}>{condition.icon} {condition.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: "#d6e8fa",
    gap: 4,
  },
  city: {
    fontSize: 26,
    fontWeight: "700",
    color: "#122a43",
  },
  temperature: {
    fontSize: 56,
    fontWeight: "700",
    color: "#122a43",
  },
  condition: {
    fontSize: 17,
    color: "#294864",
  },
});
