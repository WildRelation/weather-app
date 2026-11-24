import { StyleSheet, Text, View } from "react-native";

export function SavedForecastNotice() {
  return (
    <View style={styles.notice}>
      <Text accessibilityRole="header" style={styles.heading}>Sparad prognos</Text>
      <Text style={styles.message}>Visar senast sparade prognos för platsen.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: { gap: 4, padding: 12, borderRadius: 12, backgroundColor: "#fff1cf" },
  heading: { fontSize: 16, fontWeight: "700", color: "#694600" },
  message: { fontSize: 14, color: "#694600" },
});
