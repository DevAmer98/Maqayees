"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "maqayees-language";
const SUPPORTED_LANGUAGES = new Set(["en", "ar", "ur"]);

const normalizeLanguage = (value, fallback = "en") =>
  SUPPORTED_LANGUAGES.has(value) ? value : fallback;

const getDirection = (language) => (language === "ar" || language === "ur" ? "rtl" : "ltr");

export function usePreferredLanguage(defaultLanguage = "en") {
  const fallback = normalizeLanguage(defaultLanguage);
  const [language, setLanguageState] = useState(fallback);

  const setLanguage = useCallback((nextLanguage) => {
    const normalized = normalizeLanguage(nextLanguage, fallback);
    setLanguageState(normalized);

    try {
      window.localStorage.setItem(STORAGE_KEY, normalized);
    } catch {
      // The UI should still switch languages if storage is unavailable.
    }
  }, [fallback]);

  useEffect(() => {
    try {
      const storedLanguage = normalizeLanguage(window.localStorage.getItem(STORAGE_KEY), fallback);
      setLanguageState(storedLanguage);
    } catch {
      setLanguageState(fallback);
    }
  }, [fallback]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = getDirection(language);
  }, [language]);

  return [language, setLanguage];
}
