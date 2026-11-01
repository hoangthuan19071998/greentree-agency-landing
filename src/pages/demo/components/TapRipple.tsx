import type { FC } from 'react'
import { useEffect, useRef } from 'react'
import { RingIcon } from '@/components/RingIcon'

export const TapRipple: FC = () => {
  const tapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onTap = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' || !tapRef.current) return
      const el = tapRef.current
      el.style.left = `${e.clientX}px`
      el.style.top = `${e.clientY}px`
      el.classList.remove('go')
      void el.offsetWidth // force reflow
      el.classList.add('go')
    }

    window.addEventListener('pointerdown', onTap, { passive: true })
    return () => {
      window.removeEventListener('pointerdown', onTap)
    }
  }, [])

  return (
    <div className="tap" ref={tapRef} aria-hidden="true">
      <RingIcon size={96} strokeWidth={2.4} />
    </div>
  )
}

