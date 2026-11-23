
import { Button, Text, View } from "react-native";
import { parseWeather } from "../parsers/weatherParser";
import { getWeather } from "../services/weatherApi";

import type { Location } from "../models/Weather";

export default function Index() {

  async function testWeather() {
    try {
      const stockholm: Location = {
        id: "stockholm",
        name: "Stockholm",
        latitude: 59.3294,
        longitude: 18.0687,
        country: "Sweden",
      };

      // 1. Hämta data från API
      const data = await getWeather(
        stockholm.latitude,
        stockholm.longitude
      );

      // 2. Omvandla till vår egen modell
      const forecast = parseWeather(
        data,
        stockholm,
        new Date().toISOString()
      );

      // 3. Kontrollera resultatet
      console.log("Stad:", forecast.location.name);

      console.log(
        "Temperatur:",
        forecast.current.temperatureC
      );

      console.log("Antal dagar:", forecast.days.length);

      console.log("Första dagen:", forecast.days[0]);

      console.log(
        "Timmar första dagen:",
        forecast.days[0].hours.length
      );

    } catch (error) {
      console.error("Fel vid väderhämtning:", error);
    }
  }

  return (
    <View style={{ padding: 30 }}>
      <Text>Test av Weather API</Text>
      <Button title="Hämta väder" onPress={testWeather} />
    </View>
  );
}
