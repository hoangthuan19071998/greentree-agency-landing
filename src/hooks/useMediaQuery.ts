import { useCallback, useSyncExternalStore } from 'react'

export const matches = (query: string) =>
  typeof window !== 'undefined' && !!window.matchMedia?.(query).matches

/** Live boolean for a CSS media query. */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!window.matchMedia) return () => {}
      const mq = window.matchMedia(query)
      mq.addEventListener('change', onChange)
      return () => mq.removeEventListener('change', onChange)
    },
    [query]
  )
  return useSyncExternalStore(
    subscribe,
    () => matches(query),
    () => false
  )
}
