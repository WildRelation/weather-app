import { ScrollView, StyleSheet, Text, View } from "react-native";

import type { AppSettings, HourlyForecast } from "../models/Weather";
import { formatTemperature } from "../utils/formatTemperature";
import { getWeatherCondition } from "../utils/weatherCondition";

type HourlyForecastListProps = {
  title: string;
  hours: HourlyForecast[];
  temperatureUnit: AppSettings["temperatureUnit"];
};

export function HourlyForecastList({ title, hours, temperatureUnit }: HourlyForecastListProps) {
  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={styles.heading}>
        {title}
      </Text>
      {hours.length === 0 ? (
        <Text style={styles.condition}>Timprognos saknas för den här dagen.</Text>
      ) : (
        <ScrollView horizontal contentContainerStyle={styles.hours}>
          {hours.map((hour) => {
            const condition = getWeatherCondition(hour.weatherCode);

            return (
              <View key={hour.time} style={styles.card}>
                <Text style={styles.time}>{hour.time.slice(11, 16)}</Text>
                <Text style={styles.temperature}>
                  {formatTemperature(hour.temperatureC, temperatureUnit)}
                </Text>
                <Text style={styles.condition}>{condition.icon} {condition.label}</Text>
                <Text style={styles.condition}>
                  Vind: {hour.windSpeedKmh == null ? "–" : `${hour.windSpeedKmh} km/h`}
                </Text>
                <Text style={styles.condition}>
                  Nederbörd: {hour.precipitationMm == null ? "–" : `${hour.precipitationMm} mm`}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 8 },
  heading: { fontSize: 20, fontWeight: "700", color: "#122a43" },
  hours: { gap: 8, paddingBottom: 8 },
  card: {
    width: 160,
    gap: 4,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d6e3f0",
    backgroundColor: "#ffffff",
  },
  time: { fontSize: 16, color: "#294864" },
  temperature: { fontSize: 22, fontWeight: "700", color: "#122a43" },
  condition: { fontSize: 14, color: "#294864" },
});
