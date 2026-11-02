import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { createHeroCanvas, grainDataURL } from '@/hero-canvas/createHeroCanvas'
import { copyAt, phaseTime, setHeroTiming } from '@/hero-canvas/timeline'
import type { HeroTiming } from '@/hero-canvas/timeline'
import { MEDIA } from '@/config/site'

export interface HeroFilmRefs {
  section: RefObject<HTMLElement | null>
  canvas: RefObject<HTMLCanvasElement | null>
  grain: RefObject<HTMLDivElement | null>
  headlineA: RefObject<HTMLHeadingElement | null>
  headlineB: RefObject<HTMLParagraphElement | null>
  subA: RefObject<HTMLParagraphElement | null>
  subB: RefObject<HTMLParagraphElement | null>
  fill: RefObject<HTMLDivElement | null>
}

/** Canvas resolution cap: soft line art gains little above this. */
const MAX_DPR = 1.5

/**
 * Drives the hero film: one canvas renderer, the copy layered over it, and the
 * playback rules — pause when off screen or in a background tab, honour
 * reduced motion, and let the visitor pause it (moving content over 5s must
 * be pausable). The copy is written straight to the DOM each frame through
 * refs; React re-renders only when the chapter changes (twice a loop).
 * `labels` replaces the words written on the rings, e.g. for another language.
 */
export function useHeroFilm(refs: HeroFilmRefs, timing?: HeroTiming, labels?: readonly string[]) {
  const [paused, setPaused] = useState(false)
  const [chapter, setChapter] = useState(0)
  const pausedRef = useRef(false)
  const labelsRef = useRef<readonly string[] | undefined>(undefined)
  const controls = useRef<{
    play: () => void
    pause: () => void
    setLabels: (texts: readonly string[]) => void
  } | null>(null)

  // Tempo: only when a `timing` prop is given, applied before the film starts
  // and live whenever it changes. Without it, the module-wide timing set in
  // timeline.ts stands. Declared first so it runs before playback starts.
  const timingKey = timing ? JSON.stringify(timing) : null
  useEffect(() => {
    if (timingKey) setHeroTiming(JSON.parse(timingKey) as HeroTiming)
  }, [timingKey])

  // Ring labels: picked up when the film starts (below), swapped live after.
  const labelsKey = labels ? JSON.stringify(labels) : null
  useEffect(() => {
    labelsRef.current = labelsKey ? (JSON.parse(labelsKey) as string[]) : undefined
    if (labelsRef.current) controls.current?.setLabels(labelsRef.current)
  }, [labelsKey])

  useEffect(() => {
    const section = refs.section.current
    const canvas = refs.canvas.current
    if (!section || !canvas) return

    const reduce = window.matchMedia(MEDIA.reducedMotion).matches
    if (refs.grain.current) refs.grain.current.style.backgroundImage = `url(${grainDataURL()})`

    // copy: written only when a value changes
    const last = new Map<HTMLElement, string>()
    const rise = (el: HTMLElement | null, v: number) => {
      if (!el) return
      const q = Math.round(v * 200) / 200
      if (last.get(el) === String(q)) return
      last.set(el, String(q))
      el.style.opacity = String(q)
      el.style.transform = `translate3d(0, ${((1 - q) * 14).toFixed(2)}px, 0)`
    }
    let lastChapter = 0
    // with reduced motion: one still, the grown tree
    let lastT = reduce ? phaseTime('hold') : 0
    let lastFill = ''

    const film = createHeroCanvas(canvas, {
      onFrame: (t) => {
        lastT = t
        const c = copyAt(t)
        rise(refs.headlineA.current, c.headlineA)
        rise(refs.headlineB.current, c.headlineB)
        rise(refs.subA.current, c.subA)
        rise(refs.subB.current, c.subB)
        const fill = `scaleX(${c.progress.toFixed(4)})`
        if (fill !== lastFill && refs.fill.current) {
          lastFill = fill
          refs.fill.current.style.transform = fill
        }
        if (c.chapter !== lastChapter) {
          lastChapter = c.chapter
          setChapter(c.chapter)
        }
      },
    })
    if (labelsRef.current) film.setLabels(labelsRef.current)

    let visible = true
    const shouldPlay = () => visible && !document.hidden && !pausedRef.current && !reduce
    const sync = () => {
      if (shouldPlay()) {
        if (!film.playing) film.start(lastT)
      } else if (film.playing) film.stop()
    }

    const resize = () => {
      const { width, height } = section.getBoundingClientRect()
      if (!width || !height) return
      film.setSize(width, height, Math.min(window.devicePixelRatio || 1, MAX_DPR))
      if (!film.playing) film.renderAt(lastT)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(section)

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      sync()
    })
    io.observe(section)
    document.addEventListener('visibilitychange', sync)

    controls.current = {
      play: () => {
        pausedRef.current = false
        sync()
      },
      pause: () => {
        pausedRef.current = true
        sync()
      },
      setLabels: (texts) => {
        film.setLabels(texts)
        if (!film.playing) film.renderAt(lastT)
      },
    }
    // the labels on the rings are drawn in the display face: redraw a still
    // once it has loaded
    document.fonts?.ready.then(() => {
      if (!film.playing) film.renderAt(lastT)
    })
    sync()

    return () => {
      film.stop()
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', sync)
      controls.current = null
    }
    // refs are stable for the component's lifetime
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggle = () => {
    const next = !pausedRef.current
    setPaused(next)
    if (next) controls.current?.pause()
    else controls.current?.play()
  }

  return { paused, toggle, chapter }
}
