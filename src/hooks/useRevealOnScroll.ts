import { useEffect } from 'react'
import type { RefObject } from 'react'

/**
 * Adds `.in` to every `.rv` inside the root once it scrolls into view.
 * Reduced motion is handled in CSS (`.rv` is shown without a transition).
 */
export function useRevealOnScroll(rootRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    if (!('IntersectionObserver' in window)) {
      root.querySelectorAll('.rv').forEach((el) => el.classList.add('in'))
      return
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue
          en.target.classList.add('in')
          io.unobserve(en.target)
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 }
    )
    // Let the first layout settle so above-the-fold items animate in.
    const t = setTimeout(() => {
      root.querySelectorAll('.rv:not(.in)').forEach((el) => io.observe(el))
    }, 50)

    return () => {
      clearTimeout(t)
      io.disconnect()
    }
  }, [rootRef])
}
