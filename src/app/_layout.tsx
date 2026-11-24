import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#d6e8fa" },
        headerTintColor: "#122a43",
      }}
    >
      <Stack.Screen name="index" options={{ title: "Hem" }} />
      <Stack.Screen name="forecast-day" options={{ title: "Dagsprognos" }} />
    </Stack>
  );
}
