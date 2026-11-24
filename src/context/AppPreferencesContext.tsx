import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import type { AppSettings, Location } from "../models/Weather";
import { defaultPreferences, loadAppPreferences, saveAppPreferences } from "../storage/appPreferences";
import type { AppPreferences } from "../storage/appPreferences";

type AppPreferencesContextValue = AppPreferences & {
  isReady: boolean;
  storageError: boolean;
  addFavorite: (location: Location) => void;
  removeFavorite: (id: string) => void;
  setTemperatureUnit: (unit: AppSettings["temperatureUnit"]) => void;
  setRefreshInterval: (minutes: AppSettings["refreshIntervalMinutes"]) => void;
};

const AppPreferencesContext = createContext<AppPreferencesContextValue | null>(null);

export function AppPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<AppPreferences | null>(null);
  const [storageError, setStorageError] = useState(false);
  const loadedPreferences = useRef<AppPreferences | null>(null);
  const pendingSave = useRef(Promise.resolve());

  useEffect(() => {
    let active = true;

    async function load() {
      let savedPreferences = defaultPreferences;
      try {
        savedPreferences = await loadAppPreferences();
      } catch {
        if (active) setStorageError(true);
      }
      if (active) {
        loadedPreferences.current = savedPreferences;
        setPreferences(savedPreferences);
      }
    }

    void load();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (preferences === null || preferences === loadedPreferences.current) return;

    pendingSave.current = pendingSave.current.then(async () => {
      try {
        await saveAppPreferences(preferences);
        setStorageError(false);
      } catch {
        setStorageError(true);
      }
    });
  }, [preferences]);

  function addFavorite(location: Location) {
    setPreferences((current) => {
      if (current === null || current.favorites.some((favorite) => favorite.id === location.id)) {
        return current;
      }
      return { ...current, favorites: [...current.favorites, location] };
    });
  }

  function removeFavorite(id: string) {
    setPreferences((current) => current && {
      ...current,
      favorites: current.favorites.filter((favorite) => favorite.id !== id),
    });
  }

  function setTemperatureUnit(temperatureUnit: AppSettings["temperatureUnit"]) {
    setPreferences((current) => current && {
      ...current,
      settings: { ...current.settings, temperatureUnit },
    });
  }

  function setRefreshInterval(refreshIntervalMinutes: AppSettings["refreshIntervalMinutes"]) {
    setPreferences((current) => current && {
      ...current,
      settings: { ...current.settings, refreshIntervalMinutes },
    });
  }

  return (
    <AppPreferencesContext.Provider value={{
      ...(preferences ?? defaultPreferences),
      isReady: preferences !== null,
      storageError,
      addFavorite,
      removeFavorite,
      setTemperatureUnit,
      setRefreshInterval,
    }}>
      {children}
    </AppPreferencesContext.Provider>
  );
}

export function useAppPreferences() {
  const preferences = useContext(AppPreferencesContext);
  if (preferences === null) throw new Error("AppPreferencesProvider is missing");
  return preferences;
}
