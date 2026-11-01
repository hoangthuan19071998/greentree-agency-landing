import type { AnchorHTMLAttributes, FC } from 'react'
import { RingIcon } from './RingIcon'

interface RingButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  tone: 'light' | 'dark'
}

/** Pill link with a sweep fill and the tree-ring mark, e.g. "Book a call". */
export const RingButton: FC<RingButtonProps> = ({
  tone,
  className,
  children,
  ...rest
}) => (
  <a className={`btn btn-${tone}${className ? ` ${className}` : ''}`} {...rest}>
    <span className="btn-fill" />
    <span>{children}</span>
    <span className="btn-ring">
      <RingIcon size={26} strokeWidth={4.5} />
    </span>
  </a>
)
