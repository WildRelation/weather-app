import { StyleSheet, Text, View } from "react-native";

import type { DailyForecast } from "../models/Weather";
import { getWeatherCondition } from "../utils/weatherCondition";

const dayFormatter = new Intl.DateTimeFormat("sv-SE", {
  weekday: "long",
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

export function ForecastList({ days }: { days: DailyForecast[] }) {
  return (
    <View style={styles.list}>
      <Text accessibilityRole="header" style={styles.heading}>7-dagarsprognos</Text>
      {days.map((day) => {
        const condition = getWeatherCondition(day.weatherCode);
        const dateLabel = dayFormatter.format(new Date(day.date));

        return (
          <View key={day.date} style={styles.row}>
            <View style={styles.day}>
              <Text style={styles.date}>{dateLabel}</Text>
              <Text style={styles.condition}>{condition.icon} {condition.label}</Text>
            </View>
            <Text style={styles.temperature}>
              {day.minTemperatureC}°C / {day.maxTemperatureC}°C
            </Text>
          </View>
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
});
