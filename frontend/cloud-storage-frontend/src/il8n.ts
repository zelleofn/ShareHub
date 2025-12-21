import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./translation/en.json";
import es from "./translation/es.json";
import fr from "./translation/fr.json";
import de from "./translation/de.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
    fr: { translation: fr },
    de: { translation: de }
  },
  lng: localStorage.getItem("language") || "en", 
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

export default i18n;
