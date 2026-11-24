import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { DailyForecast } from "../models/Weather";
import { formatForecastDate } from "../utils/formatForecastDate";
import { getWeatherCondition } from "../utils/weatherCondition";

type ForecastListProps = {
  cityName: string;
  days: DailyForecast[];
  isStale: boolean;
};

export function ForecastList({ cityName, days, isStale }: ForecastListProps) {
  return (
    <View style={styles.list}>
      <Text accessibilityRole="header" style={styles.heading}>7-dagarsprognos</Text>
      {days.map((day) => {
        const condition = getWeatherCondition(day.weatherCode);
        const dateLabel = formatForecastDate(day.date);
        const windSpeeds = day.hours
          .map((hour) => hour.windSpeedKmh)
          .filter((speed) => speed != null);
        const maxWind = windSpeeds.length > 0 ? Math.max(...windSpeeds) : null;

        return (
          <Link
            key={day.date}
            href={{
              pathname: "/forecast-day",
              params: {
                cityName,
                date: day.date,
                min: String(day.minTemperatureC),
                max: String(day.maxTemperatureC),
                weatherCode: String(day.weatherCode),
                precipitation: day.precipitationSumMm?.toString() ?? "",
                maxWind: maxWind?.toString() ?? "",
                saved: isStale ? "1" : "0",
              },
            }}
            asChild
          >
            <Pressable
              accessibilityHint="Öppnar dagens detaljer"
              style={({ pressed }) => [styles.row, pressed && styles.pressedRow]}
            >
              <View style={styles.day}>
                <Text style={styles.date}>{dateLabel}</Text>
                <Text style={styles.condition}>{condition.icon} {condition.label}</Text>
              </View>
              <Text style={styles.temperature}>
                {day.minTemperatureC}°C / {day.maxTemperatureC}°C
              </Text>
              <Text accessible={false} aria-hidden style={styles.chevron}>›</Text>
            </Pressable>
          </Link>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 8 },
  heading: {
    fontSize: 20,
    fontWeight: "700",
    color: "#122a43",
  },
  pressedRow: { backgroundColor: "#d6e8fa" },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 12,
    padding: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d6e3f0",
    borderRadius: 12,
  },
  day: { flexGrow: 1 },
  date: { fontSize: 16, fontWeight: "600", color: "#122a43" },
  condition: { fontSize: 14, color: "#294864" },
  temperature: { fontSize: 16, color: "#122a43" },
  chevron: { fontSize: 22, color: "#294864" },
});
