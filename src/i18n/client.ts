"use client";

import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import resourcesToBackend from "i18next-resources-to-backend";
import { getOptions } from "./settings";

// Initialize i18next for client-side usage
if (!i18next.isInitialized) {
  i18next
    .use(initReactI18next)
    .use(LanguageDetector)
    .use(resourcesToBackend((language: string, namespace: string) => 
      import(`./locales/${language}/${namespace}.json`)
    ))
    .init({
      ...getOptions(),
      detection: { 
        caches: ["cookie"],
        order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag', 'path', 'subdomain']
      },
    });
}

export default i18next;