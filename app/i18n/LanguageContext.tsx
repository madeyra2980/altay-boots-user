'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import ru from './ru.json'
import kk from './kk.json'
import en from './en.json'

type Language = 'ru' | 'kk' | 'en'

const translations = {
  ru,
  kk,
  en,
}

type Translations = typeof ru

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('ru')
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language
    if (savedLang && (savedLang === 'ru' || savedLang === 'kk' || savedLang === 'en')) {
      setLanguageState(savedLang)
    }
    setIsReady(true)
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }

  const t = (key: string): string => {
    const keys = key.split('.')
    let result: any = translations[language]

    for (const k of keys) {
      if (result && result[k]) {
        result = result[k]
      } else {
        // Fallback to RU if key not found in current language
        let fallback: any = translations['ru']
        for (const fk of keys) {
          if (fallback && fallback[fk]) {
            fallback = fallback[fk]
          } else {
            return key // Return key if not found at all
          }
        }
        return fallback
      }
    }

    return typeof result === 'string' ? result : key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {isReady ? children : <div className="min-h-screen bg-stone-50"></div>}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
