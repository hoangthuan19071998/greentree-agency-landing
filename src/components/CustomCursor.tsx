import type { FC } from 'react'
import { useEffect, useRef, useState } from 'react'
import { MEDIA } from '../config/site'
import { matches } from '../hooks/useMediaQuery'
import { RingIcon } from './RingIcon'

export const CustomCursor: FC = () => {
  const curRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState(false)
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (!matches(MEDIA.finePointer)) return

    let mx = -200
    let my = -200
    let rx = -200
    let ry = -200
    let rafId: number
    let currentHover = false
    let currentActive = false

    const onMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${mx}px, ${my}px)`
      }
      if (!currentActive) {
        currentActive = true
        setActive(true)
      }
      const t = e.target as HTMLElement | null
      const isHovering = !!(t && t.closest && t.closest('a, button'))
      if (isHovering !== currentHover) {
        currentHover = isHovering
        setHover(isHovering)
      }
    }

    const onLeave = () => {
      currentHover = false
      currentActive = false
      setHover(false)
      setActive(false)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)

    const loop = () => {
      rx += (mx - rx) * 0.16
      ry += (my - ry) * 0.16
      if (curRef.current) {
        curRef.current.style.transform = `translate(${rx.toFixed(1)}px, ${ry.toFixed(1)}px)`
      }
      rafId = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      cancelAnimationFrame(rafId)
    }
  }, [])

  const ringClass = `cur-ring ${hover ? 'is-hover' : ''} ${active ? '' : 'is-off'}`
  const dotClass = `cur-dot ${active ? '' : 'is-off'}`

  return (
    <>
      <div className="cur" ref={curRef} aria-hidden="true">
        <div className={ringClass}>
          <RingIcon size={46} strokeWidth={3.2} />
        </div>
      </div>
      <div className={dotClass} ref={dotRef} aria-hidden="true" />
    </>
  )
}
