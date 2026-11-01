import type { FC } from 'react'

interface RingIconProps {
  size: number
  strokeWidth: number
}

/** The hand-drawn tree-ring mark, referenced from <TreeRingSymbol />. */
export const RingIcon: FC<RingIconProps> = ({ size, strokeWidth }) => (
  <svg
    className="ring-ico"
    viewBox="0 0 100 100"
    width={size}
    height={size}
    aria-hidden="true"
    style={{ strokeWidth }}
  >
    <use href="#gt-ring" />
  </svg>
)
