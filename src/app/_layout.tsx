import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Hem",
          headerStyle: { backgroundColor: "#d6e8fa" },
          headerTintColor: "#122a43",
        }}
      />
    </Stack>
  );
}
