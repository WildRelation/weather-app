# Frågor och svar inför muntan i Lab B2

Öva på att visa koden samtidigt som ni svarar med egna ord. Kursen börjar med **Q26**. Ha `SPEC.md`, testrapporten och appen öppna. Frågornas numrering följer kurs-PDF:ens sidor 5–6.

## Demonstration på Android

1. Skriv **Malm** och välj **Malmö, Skåne län, Sverige**. Visa aktuellt väder, dagens timmar och sjudagarslistan. Öppna en dagsdetalj och visa nederbörd och vind.
2. Visa koordinatsökningen. Ange en ogiltig latitud, prova sedan ett giltigt koordinatpar. Förklara att prognos-API:t får koordinaterna direkt.
3. Spara Malmö som favorit och öppna den från **Favoriter**. Byt till Fahrenheit i **Inställningar** och visa att hemskärmen och dagdetaljen använder samma inställning.
4. Visa offlineflödet för en plats som ni först laddat online. Gör API:erna otillgängliga och visa **Sparad prognos**. Återställ anslutningen och tryck **Försök igen**. Vid omstart i Expo Go måste telefonen kunna nå den lokala utvecklingsservern.
5. Växla mellan stående och liggande läge. Ha en dokumenterad Androidkörning och ett automatiserat test redo att visa. [Testrapporten](TEST_REPORT.md)

## Q1–6 Data och nätverk

### Q1 Var görs API-anropet och vad returneras?

`getWeather` tar latitud, longitud och en möjlig avbrytningssignal. Den skickar ett asynkront GET-anrop till Open-Meteo med bland annat sju dagar, platsens tidszon och de väderfält som appen använder. Den returnerar `response.data` som `OpenMeteoResponse`. Vid stadssökning hämtas koordinaterna först via Expo-rutten som anropar geocode.maps.co. [weatherApi.ts](../src/services/weatherApi.ts) · [geocode+api.ts](../src/app/api/geocode+api.ts)

### Q2 Hur blir JSON till appens datamodell?

`parseWeather` kontrollerar att de parallella arrayerna hör ihop. Element med samma index beskriver samma timme eller dag. Den skapar `CurrentWeather`, grupperar `HourlyForecast` per lokalt datum och bygger sju `DailyForecast`-objekt i en `WeatherForecast`. Modellen har en vald plats och en egen hämtningstidpunkt. [weatherParser.ts](../src/parsers/weatherParser.ts) · [Weather.ts](../src/models/Weather.ts)

### Q3 Vilka fält använder appen och varför?

Aktuell temperatur och väderkod används i väderkortet. Min, max och väderkod används i dagslistan. Timvärdena innehåller temperatur, väderkod, vind och nederbörd. Dagdetaljen visar nederbördssumman och högsta vind ur dagens timvärden. Tidszonen behövs för platsens lokala dygn. Metadata som höjd och API:ts svarstid mappas bort eftersom vyerna saknar behov av dem. [weatherApi.ts](../src/services/weatherApi.ts) · [weatherParser.ts](../src/parsers/weatherParser.ts) · [ForecastList.tsx](../src/components/ForecastList.tsx)

### Q4 Vad händer om ett svar med HTTP 200 saknar ett fält?

HTTP 200 betyder att servern svarade. Parsern kontrollerar därefter innehållet. En ogiltig obligatorisk temperatur eller timserie gör att parsern kastar ett fel. Repositoryt returnerar `INVALID_RESPONSE`, som visas för användaren. Ett saknat valfritt vind- eller nederbördsvärde får värdet `null` i modellen. [weatherParser.ts](../src/parsers/weatherParser.ts) · [weatherRepository.ts](../src/repositories/weatherRepository.ts)

### Q5 Hur når en sökning prognosvyn?

Hemskärmen skickar söktexten eller det valda stadsförslaget till `searchCity`. `useWeather` sätter laddning och anropar `loadWeather`. Repositoryt använder geocode.maps.co för platsens koordinater, hämtar väder från Open-Meteo, parsar och sparar prognosen. När hooken sätter sitt nya tillstånd visar Hem färsk eller sparad data. Vid direkt koordinatsökning går flödet från validering till prognos-API:t. [index.tsx](../src/app/index.tsx) · [useWeather.ts](../src/hooks/useWeather.ts) · [weatherRepository.ts](../src/repositories/weatherRepository.ts)

### Q6 Vad cachas och när uppdateras det?

AsyncStorage sparar senaste parsade prognos per plats-ID. En lyckad stadssökning kan också spara söktextens koppling till plats-ID, så att en upprepad sökning går att slå upp offline. Efter en lyckad ny hämtning ersätts prognosen för platsen. Uppdateringsintervallet i `useWeather` kan starta sådan hämtning medan appen är igång. [weatherStorage.ts](../src/storage/weatherStorage.ts) · [useWeather.ts](../src/hooks/useWeather.ts)

## Q7–12 Tillstånd

### Q7 Var ligger prognosen medan appen kör?

Visa `const [state, setState]` i `useWeather`. Prognosen ligger i `state.forecast`. `WeatherProvider` delar hookens tillstånd med skärmarna genom React Context. AsyncStorage innehåller den beständiga kopian. [useWeather.ts](../src/hooks/useWeather.ts) · [WeatherContext.tsx](../src/context/WeatherContext.tsx)

### Q8 Vad händer när användaren söker en ny stad?

`requestForecast` sätter `status` till `loading` och rensar den synliga prognosen och det föregående felet. Hem visar vilken ort som laddas. När hämtningen är färdig visas resultatet för den begärda platsen. [useWeather.ts](../src/hooks/useWeather.ts) · [index.tsx](../src/app/index.tsx)

### Q9 Hur vet vyn att nya data har kommit?

`loadWeather` lämnar resultatet till `useWeather`. Hooken kontrollerar att anropet fortfarande är aktivt och kör `setState(result)`. Context förmedlar tillståndet och React renderar vyn med de nya värdena. Vid `success` skickar Hem prognosen vidare till väderkortet och listorna. [useWeather.ts](../src/hooks/useWeather.ts) · [index.tsx](../src/app/index.tsx)

### Q10 Vad finns kvar när användaren lämnar appen?

Prognostillståndet finns i minnet så länge appen och dess provider lever. Efter en fullständig omstart läses favoriter och inställningar tillbaka från AsyncStorage, och sparade prognoser går att slå upp. Hem börjar då med en begäran om Stockholm. [AppPreferencesContext.tsx](../src/context/AppPreferencesContext.tsx) · [appPreferences.ts](../src/storage/appPreferences.ts) · [weatherRepository.ts](../src/repositories/weatherRepository.ts)

### Q11 Var hanteras laddning och gammal data?

`useWeather` äger statusfältet. En ny manuell sökning börjar med `loading` och en tom prognos så att föregående stad inte syns under den nya hämtningen. En sparad prognos efter nätverksfel har `isStale: true` och visas med **Sparad prognos**. Den schemalagda uppdateringen av samma plats kan ske medan den nuvarande prognosen visas. [useWeather.ts](../src/hooks/useWeather.ts) · [index.tsx](../src/app/index.tsx)

### Q12 Hur skyddas appen mot snabba sökningar?

I tillståndet `loading` är sökfältet och sökknapparna inaktiverade. När en begäran ersätts avbryter React-effekten den föregående begäran med `AbortController`. Hooken kontrollerar också signalen före `setState`. För stadsförslag väntar en egen effekt 350 ms, avbryter äldre anrop och visar bara resultat vars söktext matchar fältets aktuella värde. [useWeather.ts](../src/hooks/useWeather.ts) · [useCitySuggestions.ts](../src/hooks/useCitySuggestions.ts)

## Q13–18 Felhantering

### Q13 Vad visas vid timeout?

Repositoryt översätter timeout till `TIMEOUT` och meddelandet **Anropet tog för lång tid. Försök igen.** Hem visar **Försök igen**. Finns en sparad prognos som matchar begäran visas den tillsammans med felet och markeringen **Sparad prognos**. [weatherRepository.ts](../src/repositories/weatherRepository.ts) · [index.tsx](../src/app/index.tsx)

### Q14 Var skiljs nätverksfel från API-fel?

`getWeatherError` läser Axios-felkoden. `ERR_NETWORK` blir `OFFLINE`, och timeoutkoder får `TIMEOUT`. HTTP-fel från prognostjänsten blir `API_ERROR`. Ogiltiga prognosvärden från parsern hamnar i `INVALID_RESPONSE`. Platssökningen översätter svaren från serverrutten till samma felmodell. [weatherRepository.ts](../src/repositories/weatherRepository.ts) · [searchCityApi.ts](../src/services/searchCityApi.ts)

### Q15 Vad händer vid första start offline?

Appen försöker ladda Stockholm. Om nätet saknas och cachelagringen är tom visar den anslutningsfelet och **Försök igen**. Testet för offline utan sparad prognos kontrollerar att resultatet är ett nätverksfel med tom prognos. [weatherRepository.ts](../src/repositories/weatherRepository.ts) · [Testfall för tom cache](../tests/weather.test.cjs)

### Q16 Vad händer vid en senare start offline?

Finns Stockholm sparad kan appens startbegäran läsa den från AsyncStorage via plats-ID. En tidigare sökt stad kan dessutom hittas via kopplingen mellan söktext och plats-ID, även när geocodingen är otillgänglig. Hem visar att prognosen är sparad så att användaren förstår att värdena kan vara äldre. [weatherStorage.ts](../src/storage/weatherStorage.ts) · [DATA-05 och DATA-06](TEST_REPORT.md#data-scenarios)

### Q17 Var deklareras felet och hur visas det?

`WeatherError` innehåller en kod och ett meddelande. `WeatherScreenState` kan bära felet även när en sparad prognos visas. Repositoryt skapar felet, `useWeather` tar emot resultatet och `index.tsx` visar `state.error.message`. [Weather.ts](../src/models/Weather.ts) · [weatherRepository.ts](../src/repositories/weatherRepository.ts) · [index.tsx](../src/app/index.tsx)

### Q18 Vilket svårt felfall kan ni visa?

Ett konkret fall är att användaren har sparat en prognos för Springfield i Illinois och sedan väljer Springfield i Missouri. Om geocodingen är otillgänglig används den kvalificerade söktexten med region och land. Tidigare sökningar med samma stadsnamn kan därför hitta varsitt plats-ID. Visa gärna detta fall om det hör till det ni själva arbetade med. [weatherRepository.ts](../src/repositories/weatherRepository.ts) · [Testet för separata alias](../tests/weather.test.cjs)

## Q19–24 Arkitektur och navigation

### Q19 Var finns MVVM-lagren?

Skärmarna i `src/app` och komponenterna är **View**. `useWeather` fungerar som **ViewModel** för prognostillstånd, sökbegäran och uppdateringar, och `WeatherProvider` delar värdena. **Model och Repository** omfattar datamodellerna, tjänsterna, parsrarna, `loadWeather` och lagringen. [ARCHITECTURE.md](../ARCHITECTURE.md)

### Q20 Varför sköter vyn inte nätverksanropet?

Repositoryt samlar ordningen för platsuppslag, prognos, validering och cache. Hooken uttrycker resultatet som tillstånd. Vyn kan då visa samma datamodell oavsett om prognosen är färsk eller sparad. Tester kan kontrollera repositoryts felvägar med simulerade nätverkssvar utan att starta en skärm. [weatherRepository.ts](../src/repositories/weatherRepository.ts) · [weather.test.cjs](../tests/weather.test.cjs)

### Q21 Vilken logik kan testas fristående från UI?

`parseCoordinate` tar en sträng och en gräns och returnerar ett tal eller `null`. `parseWeather` tar ett JSON-svar, en plats och en hämtningstid. Båda går att testa med fasta indata. Repositorytesterna använder simulerade nätverkssvar och en minneslagring för att göra också offlinefallen upprepningsbara. [parseCoordinate.ts](../src/utils/parseCoordinate.ts) · [weatherParser.ts](../src/parsers/weatherParser.ts) · [weather.test.cjs](../tests/weather.test.cjs)

### Q22 Hur fungerar navigationen?

Expo Router bygger en Stack från filerna i `src/app`. `ForecastList` skickar vald dags värden som ruttparametrar till `forecast-day.tsx`. När användaren öppnar en favorit begär favoritskärmen en prognos via hooken och navigerar hem med `router.dismissTo`. Hooken känner bara till prognosbegäran och kan användas från flera vyer. [_layout.tsx](../src/app/_layout.tsx) · [ForecastList.tsx](../src/components/ForecastList.tsx) · [favorites.tsx](../src/app/favorites.tsx)

### Q23 Hur går ni från ett krav-ID till koden?

Öppna **W-02** i SPEC. Visa `parseCoordinate` och mata in `59,3293` som latitud. Visa att `91` avvisas av gränskontrollen. Följ sedan `loadWeather`, där koordinater valideras även i datalagret före API-anropet. Visa testet som kontrollerar att en ogiltig koordinat ger noll nätverksanrop. [SPEC.md](../SPEC.md#3-kravchecklista) · [parseCoordinate.ts](../src/utils/parseCoordinate.ts) · [weather.test.cjs](../tests/weather.test.cjs)

### Q24 Hur skulle ni lägga till fler timprognoser?

Dagens timmar visas redan på Hem. För att visa timmarna för varje vald dag kan detaljvyn återanvända `HourlyForecastList` och hämta dagen ur `WeatherForecast.days` med plats-ID och datum. Parsern grupperar redan timmarna per lokal dag. Det gör förändringen främst till en uppgift för navigation och presentation. [Weather.ts](../src/models/Weather.ts) · [HourlyForecastList.tsx](../src/components/HourlyForecastList.tsx)

## Q25–30 AI och arbetssätt

### Q25 Vilken AI-assisterad funktion kan ni förklara rad för rad?

Visa `parseCoordinate`. Först trimmas texten och decimalkommat ersätts med punkt. Nästa rad kräver att hela texten är ett giltigt format för ett tal. Sedan konverteras texten med `Number`. Till sist kontrollerar `isValidCoordinate` att värdet är ändligt och inom gränsen 90 för latitud eller 180 för longitud. Testa gärna att förklara `59,3293` och `91` utan att läsa från skärmen. [parseCoordinate.ts](../src/utils/parseCoordinate.ts)

### Q26 Visa AI-instruktionerna och ett krav

Öppna avsnitt 1 i SPEC och peka på instruktionerna om att studenten ska verifiera och kunna förklara koden. Välj sedan **W-11**. Visa hur `loadWeather` hanterar `OFFLINE`, väljer rätt cachepost och returnerar `isStale: true`. Följ resultatet till **Sparad prognos** på Hem. Avsluta med testet som går offline efter en lyckad hämtning och kontrollerar att samma plats kommer tillbaka.

En kort muntlig förklaring kan börja så här. *W-11 gäller när vädertjänsten är otillgänglig. Vi sparar prognoser per plats-ID. Vid nätverksfel hämtar vi cacheposten för den begärda platsen och markerar resultatet som sparat i vyn.* [SPEC.md](../SPEC.md) · [weatherRepository.ts](../src/repositories/weatherRepository.ts) · [weather.test.cjs](../tests/weather.test.cjs)

### Q27 Vad ändrade ni i ett AI-förslag och varför?

Ett dokumenterat exempel är leverantörsvalet. Appen använde först Open-Meteo även för platssökning. Efter kontroll av kurs-PDF:en byttes koordinatuppslaget till geocode.maps.co, som listas för internationella platser. Open-Meteo används för prognosen och för namnförslagen. Välj ett exempel ni själva deltog i och förklara vad som gjorde ändringen nödvändig. [Beslutsloggen](../SPEC.md#6-beslutslogg) · [geocode+api.ts](../src/app/api/geocode+api.ts)

### Q28 Hur kontrollerade ni att AI-genererad kod fungerar?

Visa testet `offline searches never substitute the forecast of a different location`. Det sparar ett lyckat resultat, simulerar ett nätverksfel och begär en annan plats. Testet förväntar sig `OFFLINE` och en tom prognos. Om appen i stället visade vilken cachad prognos som helst skulle testet falla. Visa sedan ett Androidscenario ni själva har kört och förklara vad ni observerade. [weather.test.cjs](../tests/weather.test.cjs) · [Testrapporten](TEST_REPORT.md)

### Q29 Vilken prompt fungerade bra?

Välj en faktisk prompt från er processlogg. Ett exempel från projektet är *Jag vill att det ska komma förslag och sedan trycka för att välja stad*. Den beskriver både en inmatning och en användaråtgärd. Den är lätt att omsätta till ett test där ni skriver `Malm`, väljer Malmö och ser rätt prognos. Förklara varför just er valda prompt gav ett svar ni kunde granska. [DATA-01 i testrapporten](TEST_REPORT.md#data-scenarios)

### Q30 Vad skulle ni göra annorlunda nästa gång?

Utgå från en händelse ni själva minns. Ett möjligt förbättringsområde är att kontrollera kursens tillåtna API:er och deras autentisering innan implementationen så att ett leverantörsbyte undviks. Ett annat är att köra Androidscenarier och logga utfallet direkt efter varje ändring. Välj en åtgärd som passar er egen erfarenhet och förklara vad den skulle ha hjälpt er med.
