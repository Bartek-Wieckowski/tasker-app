import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import enCommon from "../locales/en/common.json";
import plCommon from "../locales/pl/common.json";

const resources = {
  en: {
    common: enCommon,
  },
  pl: {
    common: plCommon,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    debug: import.meta.env.DEV,

    interpolation: {
      escapeValue: false,
    },

    detection: {
      order: [],
      caches: [],
    },

    defaultNS: "common",
    ns: ["common"],
  });

export default i18n;
