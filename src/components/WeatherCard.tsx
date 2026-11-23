import { StyleSheet, Text, View } from "react-native";

import { getWeatherCondition } from "../utils/weatherCondition";

type WeatherCardProps = {
  cityName: string;
  temperatureC: number;
  weatherCode: number;
};

export function WeatherCard({ cityName, temperatureC, weatherCode }: WeatherCardProps) {
  const condition = getWeatherCondition(weatherCode);

  return (
    <View style={styles.card}>
      <Text accessibilityRole="header" style={styles.city}>{cityName}</Text>
      <Text style={styles.temperature}>{temperatureC}°C</Text>
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
