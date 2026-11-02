import { createContext, useContext } from 'react'

export type Lang = 'en' | 'vi'

export const LANGS: readonly Lang[] = ['en', 'vi']

/** One value per language, e.g. `{ en: 'Services', vi: 'Dịch vụ' }`. */
export type Localized<T = string> = Record<Lang, T>

/** `T` with every Localized value inside it replaced by one language. */
export type Resolved<T> =
  T extends Localized<infer U>
    ? U
    : T extends readonly (infer E)[]
      ? Resolved<E>[]
      : T extends object
        ? { [K in keyof T]: Resolved<T[K]> }
        : T

function isLocalized(v: unknown): v is Localized<unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v) && LANGS.every((l) => l in v)
}

/** Picks one language out of a data tree that mixes Localized and plain values. */
export function localize<T>(value: T, lang: Lang): Resolved<T> {
  if (isLocalized(value)) return value[lang] as Resolved<T>
  if (Array.isArray(value)) return value.map((v) => localize(v, lang)) as Resolved<T>
  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, localize(v, lang)])
    ) as Resolved<T>
  }
  return value as Resolved<T>
}

interface LangState {
  lang: Lang
  setLang: (lang: Lang) => void
}

// English without a provider, so shared components (e.g. FilmHero on /demo)
// still render.
export const LangContext = createContext<LangState>({ lang: 'en', setLang: () => {} })

export const useLang = () => useContext(LangContext)

/** The current language's entry of a component's copy table. */
export function useCopy<T>(copy: Localized<T>): T {
  return copy[useLang().lang]
}
