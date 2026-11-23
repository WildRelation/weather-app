const weatherConditions: Record<number, { icon: string; label: string }> = {
  0: { icon: "☀️", label: "Klart" },
  2: { icon: "⛅", label: "Delvis molnigt" },
  3: { icon: "☁️", label: "Molnigt" },
  61: { icon: "🌧️", label: "Lätt regn" },
};

export function getWeatherCondition(weatherCode: number) {
  return weatherConditions[weatherCode] ?? { icon: "—", label: "Okänt väder" };
}
