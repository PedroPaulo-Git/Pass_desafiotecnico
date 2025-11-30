"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { translations, type Language, type TranslationKeys } from "./translations"

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: TranslationKeys
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("pt")

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    if (typeof window !== "undefined") {
      localStorage.setItem("language", lang)
    }
  }, [])

  const t = translations[language]

  return <I18nContext.Provider value={{ language, setLanguage, t }}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}
