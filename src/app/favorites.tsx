import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppPreferences } from "../context/AppPreferencesContext";
import { useWeatherContext } from "../context/WeatherContext";
import type { Location } from "../models/Weather";

export default function Favorites() {
  const { favorites, isReady, storageError, removeFavorite } = useAppPreferences();
  const { searchLocation } = useWeatherContext();

  function openFavorite(location: Location) {
    searchLocation(location);
    router.dismissTo("/");
  }

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {storageError && (
          <Text accessibilityRole="alert" style={styles.message}>
            Lokal lagring är inte tillgänglig. Ändringar kan försvinna vid omstart.
          </Text>
        )}
        {!isReady && <Text style={styles.description}>Laddar favoriter…</Text>}
        {isReady && favorites.length === 0 && (
          <Text style={styles.description}>Inga favoriter än. Spara en plats från startsidan.</Text>
        )}
        {favorites.map((location) => (
          <View key={location.id} style={styles.row}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Öppna prognos för ${location.name}`}
              onPress={() => openFavorite(location)}
              style={styles.open}
            >
              <Text style={styles.place}>{location.name}</Text>
              {location.country && <Text style={styles.description}>{location.country}</Text>}
              <Text style={styles.action}>Öppna prognos ›</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Ta bort ${location.name} från favoriter`}
              onPress={() => removeFavorite(location.id)}
              style={styles.remove}
            >
              <Text style={styles.removeText}>Ta bort</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f0f6fc" },
  content: { width: "100%", maxWidth: 580, alignSelf: "center", padding: 16, gap: 12 },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },
  open: { flexGrow: 1, flexBasis: 160, padding: 12, gap: 4 },
  place: { fontSize: 18, fontWeight: "700", color: "#122a43" },
  description: { fontSize: 16, color: "#294864" },
  action: { color: "#185388", fontWeight: "600" },
  remove: { minHeight: 48, justifyContent: "center", paddingHorizontal: 12 },
  removeText: { fontSize: 16, color: "#8e2828" },
  message: { color: "#8e2828", fontSize: 16 },
});
