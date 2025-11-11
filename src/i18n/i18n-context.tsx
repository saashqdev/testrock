"use client";

import React, { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18next from "./client";

export function I18nProvider({ children, language }: { children: React.ReactNode; language: string }) {
  useEffect(() => {
    if (i18next.isInitialized && i18next.language !== language) {
      i18next.changeLanguage(language);
    }
  }, [language]);

  return <I18nextProvider i18n={i18next}>{children}</I18nextProvider>;
}
