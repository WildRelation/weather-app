import { Stack } from "expo-router";

import { AppPreferencesProvider } from "../context/AppPreferencesContext";
import { WeatherProvider } from "../context/WeatherContext";

export default function RootLayout() {
  return (
    <AppPreferencesProvider>
      <WeatherProvider>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: "#d6e8fa" },
            headerTintColor: "#122a43",
          }}
        >
          <Stack.Screen name="index" options={{ title: "Hem" }} />
          <Stack.Screen name="forecast-day" options={{ title: "Dagsprognos" }} />
          <Stack.Screen name="favorites" options={{ title: "Favoriter" }} />
          <Stack.Screen name="settings" options={{ title: "Inställningar" }} />
        </Stack>
      </WeatherProvider>
    </AppPreferencesProvider>
  );
}
