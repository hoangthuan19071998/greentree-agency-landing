import type { FC } from 'react'
import { LOGO } from '../config/site'

export const QuoteSection: FC = () => (
  <section className="pad wrap quote">
    <img
      className="rv quote-mark"
      src={LOGO(256)}
      alt="Green Tree Agency Emblem"
      width="72"
      height="72"
    />
    <p className="serif big rv quote-text">
      {'“'}Good brands, like good trees, are{' '}
      <em className="accent-moss">grown</em> {'—'} not just built.
      {'”'}
    </p>
  </section>
)
