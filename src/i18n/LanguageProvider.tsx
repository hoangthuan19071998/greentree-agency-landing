import type { FC, ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { LANGS, LangContext } from './lang'
import type { Lang, Localized } from './lang'

const STORAGE_KEY = 'gt-lang'

const TITLES: Localized = {
  en: 'Green Tree Agency — Homepage',
  vi: 'Green Tree Agency — Trang chủ',
}

const isLang = (v: string | null): v is Lang => LANGS.includes(v as Lang)

/** `?lang=vi` wins, then the visitor's last choice, then the browser language. */
function initialLang(): Lang {
  const fromUrl = new URLSearchParams(window.location.search).get('lang')
  if (isLang(fromUrl)) return fromUrl
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (isLang(saved)) return saved
  } catch {
    // storage blocked: fall through
  }
  return navigator.language.toLowerCase().startsWith('vi') ? 'vi' : 'en'
}

export const LanguageProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState(initialLang)

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = TITLES[lang]
  }, [lang])

  const value = useMemo(
    () => ({
      lang,
      setLang: (next: Lang) => {
        setLangState(next)
        try {
          localStorage.setItem(STORAGE_KEY, next)
        } catch {
          // storage blocked: the choice lasts for this visit only
        }
      },
    }),
    [lang]
  )

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}
