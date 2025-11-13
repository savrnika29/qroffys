import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Translations
import en from "./locales/en/translation.json";
import hi from "./locales/hi/translation.json";
import fr from "./locales/fr/translation.json";
import es from "./locales/es/translation.json";
import de from "./locales/de/translation.json";

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  fr: { translation: fr },
  es: { translation: es },
  de: { translation: de },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

export default i18n;
