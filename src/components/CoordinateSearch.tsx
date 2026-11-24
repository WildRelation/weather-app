import { useState } from "react";
import { Keyboard, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { parseCoordinate } from "../utils/parseCoordinate";

type CoordinateSearchProps = {
  disabled: boolean;
  onSearch: (latitude: number, longitude: number) => void;
};

export function CoordinateSearch({ disabled, onSearch }: CoordinateSearchProps) {
  const [latitudeText, setLatitudeText] = useState("");
  const [longitudeText, setLongitudeText] = useState("");
  const [error, setError] = useState("");

  function submit() {
    if (disabled) return;

    const latitude = parseCoordinate(latitudeText, 90);
    const longitude = parseCoordinate(longitudeText, 180);
    if (latitude === null) {
      setError("Ange en latitud mellan −90 och 90.");
      return;
    }
    if (longitude === null) {
      setError("Ange en longitud mellan −180 och 180.");
      return;
    }

    setError("");
    Keyboard.dismiss();
    onSearch(latitude, longitude);
  }

  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={styles.heading}>Sök med koordinater</Text>
      <View style={styles.fields}>
        <View style={styles.field}>
          <Text style={styles.label}>Latitud</Text>
          <TextInput
            accessibilityLabel="Latitud"
            placeholder="59,3293"
            placeholderTextColor="#52687e"
            autoCorrect={false}
            editable={!disabled}
            value={latitudeText}
            onChangeText={(text) => {
              setLatitudeText(text);
              setError("");
            }}
            style={styles.input}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Longitud</Text>
          <TextInput
            accessibilityLabel="Longitud"
            placeholder="18,0686"
            placeholderTextColor="#52687e"
            autoCorrect={false}
            editable={!disabled}
            value={longitudeText}
            onChangeText={(text) => {
              setLongitudeText(text);
              setError("");
            }}
            onSubmitEditing={submit}
            returnKeyType="search"
            style={styles.input}
          />
        </View>
      </View>
      {error !== "" && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={submit}
        style={[styles.button, disabled && styles.disabled]}
      >
        <Text style={styles.buttonText}>Sök med koordinater</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 8 },
  heading: { fontSize: 18, fontWeight: "700", color: "#122a43" },
  fields: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  field: { flexGrow: 1, flexBasis: 120, gap: 4 },
  label: { fontSize: 14, color: "#294864" },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#a9bed4",
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#ffffff",
    color: "#122a43",
    fontSize: 16,
  },
  button: {
    alignSelf: "flex-start",
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#185388",
  },
  disabled: { backgroundColor: "#52687e" },
  buttonText: { color: "#ffffff", fontSize: 16, fontWeight: "600" },
  error: { color: "#8e2828", fontSize: 16 },
});
