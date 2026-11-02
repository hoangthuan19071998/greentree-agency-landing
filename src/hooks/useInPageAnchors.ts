import { useEffect } from 'react'

/**
 * Same-page `#id` links scroll to their section without writing the hash
 * into the URL. Scrolling still honours CSS `scroll-behavior` and
 * `scroll-margin-top`, so it looks exactly like native anchor jumps.
 */
export function useInPageAnchors() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const link = (e.target as Element | null)?.closest?.('a[href^="#"]')
      if (!(link instanceof HTMLAnchorElement) || link.target === '_blank') return
      const id = decodeURIComponent(link.hash.slice(1))
      const section = id && document.getElementById(id)
      if (!section) return
      e.preventDefault()
      section.scrollIntoView()
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])
}
