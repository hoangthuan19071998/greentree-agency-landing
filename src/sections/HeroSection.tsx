import type { FC, RefObject } from 'react'
import { heroAcronym } from '../data/process'

interface HeroSectionProps {
  ringRef?: RefObject<SVGSVGElement | null>
}

// Off-centre rings read as grown, not drawn: [cx, cy, r, stroke]
const rings = [
  [490, 490, 480, '#2E4D3E'],
  [478, 500, 420, '#2E4D3E'],
  [496, 486, 356, '#2E4D3E'],
  [484, 496, 300, '#3B5E4C'],
  [492, 488, 236, '#3B5E4C'],
  [486, 494, 178, '#4A6E5A'],
  [494, 490, 118, '#4A6E5A'],
  [490, 492, 62, '#6B8B6E'],
] as const

export const HeroSection: FC<HeroSectionProps> = ({ ringRef }) => (
  <section id="top" className="hero">
    {/* Rotates with scroll (see useScrollScene); anchored to the 1440px grid */}
    <div className="hero-ring-frame" aria-hidden="true">
      <svg
        className="hero-ring"
        ref={ringRef}
        width="980"
        height="980"
        viewBox="0 0 980 980"
        fill="none"
        aria-hidden="true"
      >
        {rings.map(([cx, cy, r, stroke]) => (
          <circle key={r} cx={cx} cy={cy} r={r} stroke={stroke} strokeWidth="1" />
        ))}
        <circle cx="490" cy="490" r="8" fill="#C9D8B0" />
      </svg>
    </div>

    <div className="pad two-col hero-grid">
      <h1 className="serif hero-letters">
        {heroAcronym.map(([letter, rest], i) => (
          <span className="hl" key={i}>
            <span>
              {letter}
              <em className="word">{rest}</em>
            </span>
          </span>
        ))}
      </h1>

      <div className="hero-side">
        <p className="hero-kicker">Digital Growth Studio</p>
        <p className="serif hero-tagline">
          Brands aren't built overnight. They're grown.
        </p>
        <p className="hero-lede">
          Performance advertising, content and digital strategy {'—'}{' '}
          rooted in data, cultivated with care.
        </p>
      </div>
    </div>
  </section>
)
