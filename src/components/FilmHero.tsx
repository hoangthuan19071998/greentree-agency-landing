import { useRef } from 'react'
import type { FC } from 'react'
import { RingButton } from '@/components/RingButton'
import { CHAPTERS } from '@/hero-canvas/timeline'
import type { HeroTiming } from '@/hero-canvas/timeline'
import { useHeroFilm } from '@/hooks/useHeroFilm'
import '@/styles/film-hero.css'

interface FilmHeroProps {
  /**
   * The film's tempo (see setHeroTiming), e.g. `{ speed: 0.8 }` or
   * `{ phases: { grow: 4.5, hold: 2 } }`. Defaults to an 11 s loop.
   */
  timing?: HeroTiming
}

/**
 * The living-brand hero: a seed is sown, roots spread, the tree grows, the
 * camera dives into its trunk and the growth rings open with the services.
 * Drawn live on a canvas from code (src/hero-canvas); the copy is real text
 * layered on top. The first headline is the page's h1; the second, shown
 * over the rings, is decorative and hidden from assistive tech.
 */
export const FilmHero: FC<FilmHeroProps> = ({ timing }) => {
  const section = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const grain = useRef<HTMLDivElement>(null)
  const headlineA = useRef<HTMLHeadingElement>(null)
  const headlineB = useRef<HTMLParagraphElement>(null)
  const subA = useRef<HTMLParagraphElement>(null)
  const subB = useRef<HTMLParagraphElement>(null)
  const chapter = useRef<HTMLSpanElement>(null)
  const fill = useRef<HTMLDivElement>(null)
  const { paused, toggle } = useHeroFilm({ section, canvas, grain, headlineA, headlineB, subA, subB, chapter, fill }, timing)

  return (
    <section id="top" className="film-hero" ref={section} aria-label="Green Tree Agency">
      <canvas className="film-hero-canvas" ref={canvas} aria-hidden="true" />
      <div className="film-hero-grain" ref={grain} aria-hidden="true" />

      <div className="film-hero-copy">
        <div className="film-hero-stack">
          <h1 className="film-hero-title" ref={headlineA}>
            Brands aren't
            <br />
            built overnight.
            <br />
            <em>They're grown.</em>
          </h1>
          <p className="film-hero-title" ref={headlineB} aria-hidden="true">
            Every ring
            <br />
            <em>tells a story</em>
            <br />
            of growth.
          </p>
        </div>
        <div className="film-hero-stack">
          <p className="film-hero-sub" ref={subA}>
            Strategy. Creativity. Measurable growth.
          </p>
          <p className="film-hero-sub" ref={subB} aria-hidden="true">
            From strong roots to lasting impact.
          </p>
        </div>
        <RingButton tone="light" className="film-hero-cta" href="#contact">
          Let's grow together
        </RingButton>
      </div>

      <div className="film-hero-foot">
        <div className="film-hero-meta">
          <button
            type="button"
            className="film-hero-toggle"
            onClick={toggle}
            aria-pressed={paused}
            aria-label={paused ? 'Play the animation' : 'Pause the animation'}
          >
            {paused ? 'Play' : 'Pause'}
          </button>
          <span className="film-hero-chapter" ref={chapter}>
            {CHAPTERS[0]}
          </span>
        </div>
        <div className="film-hero-track" aria-hidden="true">
          <div className="film-hero-fill" ref={fill} />
        </div>
        <div className="film-hero-labels">
          <span>Strategy / Creative / Performance</span>
          <a href="#about">Scroll to explore</a>
        </div>
      </div>
    </section>
  )
}
