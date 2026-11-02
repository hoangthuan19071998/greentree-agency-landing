import { useEffect, useRef } from 'react'
import type { FC } from 'react'
import { createHeroCanvas, grainDataURL } from '@/hero-canvas/createHeroCanvas'
import { MEDIA } from '@/config/site'

/** Canvas resolution cap, as in the hero. */
const MAX_DPR = 1.5

/**
 * The hero's tree, grown, with its leaves falling: the hero renderer itself
 * (src/hero-canvas), held on the finished tree. Plays only while `active`.
 */
export const PopupTree: FC<{ active: boolean }> = ({ active }) => {
  const box = useRef<HTMLDivElement>(null)
  const ref = useRef<HTMLCanvasElement>(null)
  const grain = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = box.current
    const canvas = ref.current
    if (!el || !canvas || !active) return
    if (grain.current) grain.current.style.backgroundImage = `url(${grainDataURL()})`
    const film = createHeroCanvas(canvas, { centred: true })
    film.holdGrown()
    const reduce = window.matchMedia(MEDIA.reducedMotion).matches

    const resize = () => {
      const { width, height } = el.getBoundingClientRect()
      if (!width || !height) return
      film.setSize(width, height, Math.min(window.devicePixelRatio || 1, MAX_DPR))
      film.renderGrown(0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)
    // reduced motion: the still tree, no falling leaves
    if (!reduce) film.start()

    return () => {
      film.stop()
      ro.disconnect()
    }
  }, [active])

  return (
    <div className="contact-popup-tree" ref={box} aria-hidden="true">
      <canvas ref={ref} />
      <div className="contact-popup-tree-grain" ref={grain} />
    </div>
  )
}
