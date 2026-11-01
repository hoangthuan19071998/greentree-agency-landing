import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

export interface JourneyRefs {
  sectionRef: RefObject<HTMLElement | null>
  pinRef: RefObject<HTMLDivElement | null>
  trackRef: RefObject<HTMLDivElement | null>
  progressRef: RefObject<HTMLSpanElement | null>
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

/**
 * Scroll-linked effects for the page:
 * - page reading progress bar (always)
 * - hero ring rotation and the pinned horizontal journey (when `horizontal`)
 *
 * In horizontal mode the journey section is given a height equal to its
 * sideways overflow, and vertical scroll inside it is mapped to a translateX
 * of the track. In-page links and keyboard focus that target a panel are
 * redirected to the matching vertical scroll position.
 */
export function useScrollScene(horizontal: boolean) {
  const rootRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<SVGSVGElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const journeyProgressRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const pageBar = progressRef.current
    const ring = ringRef.current
    const section = sectionRef.current
    const pin = pinRef.current
    const track = trackRef.current
    const journeyBar = journeyProgressRef.current
    const journey = horizontal && section && pin && track ? { section, pin, track } : null

    let dist = 0
    let ticking = false
    let parallax: NodeListOf<SVGElement> | null = null
    let disposed = false

    const pinTop = (fallback: number) =>
      journey ? parseFloat(getComputedStyle(journey.pin).top) || fallback : fallback

    const layout = () => {
      if (!journey) return
      dist = Math.max(0, journey.track.scrollWidth - journey.pin.clientWidth)
      journey.section.style.height = `${journey.pin.offsetHeight + dist}px`
    }

    const update = () => {
      ticking = false
      // A frame queued before cleanup must not re-apply inline transforms.
      if (disposed) return
      const vh = window.innerHeight || 800
      const r = root.getBoundingClientRect()
      const pg = clamp01(-r.top / Math.max(1, r.height - vh))
      if (pageBar) pageBar.style.transform = `scaleX(${pg.toFixed(4)})`

      if (!journey) return

      if (ring) {
        const hp = clamp01(-r.top / 900)
        ring.style.transform = `rotate(${(hp * 140).toFixed(2)}deg) scale(${(1 + hp * 0.15).toFixed(3)})`
      }

      if (journey.pin.scrollLeft !== 0) journey.pin.scrollLeft = 0
      if (!dist) return

      const p = clamp01((pinTop(0) - journey.section.getBoundingClientRect().top) / dist)
      journey.track.style.transform = `translate3d(${(-p * dist).toFixed(1)}px, 0, 0)`
      if (journeyBar) journeyBar.style.transform = `scaleX(${p.toFixed(4)})`

      parallax ??= journey.section.querySelectorAll<SVGElement>('.hz-par')
      const off = ((p - 0.5) * 120).toFixed(1)
      parallax.forEach((el) => (el.style.transform = `translateX(${off}px) scale(1.12)`))
    }

    // Scroll the window so a track panel sits at the left edge of the pin.
    const scrollToPanel = (panel: HTMLElement, behavior: ScrollBehavior) => {
      if (!journey) return
      if (!dist) layout()
      if (!dist) return
      const top = journey.section.getBoundingClientRect().top + window.scrollY - pinTop(80)
      const left = panel.getBoundingClientRect().left - journey.track.getBoundingClientRect().left
      window.scrollTo({ top: top + Math.max(0, Math.min(dist, left)), behavior })
    }

    const onClick = (e: MouseEvent) => {
      if (!journey || e.defaultPrevented || e.button !== 0) return
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const link = (e.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]')
      const id = link?.getAttribute('href')?.slice(1)
      const target = id ? document.getElementById(id) : null
      if (!target || !journey.track.contains(target)) return
      e.preventDefault()
      scrollToPanel(target.closest<HTMLElement>('.hz-panel') || target, 'smooth')
    }

    const onFocusIn = (e: FocusEvent) => {
      const el = e.target as HTMLElement | null
      if (!journey || !el || !journey.track.contains(el)) return
      const panel = el.closest<HTMLElement>('.hz-panel')
      if (!panel) return
      // The browser starts its own (smooth) scroll to the focused element right
      // after focusin, aiming at the element's untransformed position. Wait a
      // frame, then replace it with an instant scroll to the panel's mapped
      // position ('instant' cancels the smooth scroll and ignores the html
      // smooth-scroll rule), so the track and the focused element line up.
      requestAnimationFrame(() => {
        if (document.activeElement !== el) return
        scrollToPanel(panel, 'instant')
        update()
      })
    }

    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }

    const onResize = () => {
      if (disposed) return
      parallax = null
      layout()
      onScroll()
    }

    document.addEventListener('scroll', onScroll, { capture: true, passive: true })
    window.addEventListener('resize', onResize, { passive: true })
    root.addEventListener('click', onClick)
    root.addEventListener('focusin', onFocusIn)

    // Re-measure once images and web fonts have changed the track width.
    const t1 = setTimeout(onResize, 80)
    const t2 = setTimeout(onResize, 600)
    document.fonts?.ready.then(onResize)

    return () => {
      disposed = true
      document.removeEventListener('scroll', onScroll, { capture: true })
      window.removeEventListener('resize', onResize)
      root.removeEventListener('click', onClick)
      root.removeEventListener('focusin', onFocusIn)
      clearTimeout(t1)
      clearTimeout(t2)
      // Drop any inline layout the horizontal driver applied.
      if (journey) {
        journey.section.style.height = ''
        journey.track.style.transform = ''
      }
      section
        ?.querySelectorAll<SVGElement>('.hz-par')
        .forEach((el) => (el.style.transform = ''))
    }
  }, [horizontal])

  const journey: JourneyRefs = {
    sectionRef,
    pinRef,
    trackRef,
    progressRef: journeyProgressRef,
  }
  return { rootRef, progressRef, ringRef, journey }
}
