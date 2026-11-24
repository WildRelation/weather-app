import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppPreferences } from "../context/AppPreferencesContext";
import { refreshIntervals } from "../storage/appPreferences";

type SettingOptionProps = {
  label: string;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
};

function SettingOption({ label, selected, disabled, onPress }: SettingOptionProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.option, selected && styles.selectedOption, disabled && styles.disabledOption]}
    >
      <Text style={[styles.optionText, selected && styles.selectedText]}>{label}</Text>
    </Pressable>
  );
}

export default function Settings() {
  const { settings, isReady, storageError, setTemperatureUnit, setRefreshInterval } =
    useAppPreferences();

  return (
    <SafeAreaView style={styles.screen} edges={["left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        {storageError && (
          <Text accessibilityRole="alert" style={styles.message}>
            Lokal lagring är inte tillgänglig. Ändringar kan försvinna vid omstart.
          </Text>
        )}
        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.heading}>Temperaturenhet</Text>
          <View accessibilityRole="radiogroup" accessibilityLabel="Temperaturenhet" style={styles.options}>
            <SettingOption
              label="Celsius (°C)"
              selected={settings.temperatureUnit === "celsius"}
              disabled={!isReady}
              onPress={() => setTemperatureUnit("celsius")}
            />
            <SettingOption
              label="Fahrenheit (°F)"
              selected={settings.temperatureUnit === "fahrenheit"}
              disabled={!isReady}
              onPress={() => setTemperatureUnit("fahrenheit")}
            />
          </View>
        </View>
        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.heading}>Uppdateringsintervall</Text>
          <Text style={styles.description}>Så ofta hämtas vädret automatiskt medan appen är öppen.</Text>
          <View accessibilityRole="radiogroup" accessibilityLabel="Uppdateringsintervall" style={styles.options}>
            {refreshIntervals.map((minutes) => (
              <SettingOption
                key={minutes}
                label={`${minutes} min`}
                selected={settings.refreshIntervalMinutes === minutes}
                disabled={!isReady}
                onPress={() => setRefreshInterval(minutes)}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f0f6fc" },
  content: { width: "100%", maxWidth: 580, alignSelf: "center", padding: 16, gap: 16 },
  section: { padding: 16, borderRadius: 12, backgroundColor: "#ffffff", gap: 8 },
  heading: { fontSize: 18, fontWeight: "700", color: "#122a43" },
  description: { color: "#294864", fontSize: 15 },
  options: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  option: {
    minHeight: 48,
    paddingHorizontal: 12,
    justifyContent: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#a9bed4",
  },
  selectedOption: { borderColor: "#185388", backgroundColor: "#185388" },
  disabledOption: { opacity: 0.7 },
  optionText: { color: "#122a43", fontSize: 16, fontWeight: "600" },
  selectedText: { color: "#ffffff" },
  message: { color: "#8e2828", fontSize: 16 },
});
