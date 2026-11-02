import { useRef, useState } from 'react'
import type { FC, ReactNode } from 'react'
import { RingButton } from '@/components/RingButton'
import { ContactPopup } from '@/components/contact/ContactPopup'
import type { HeroTiming } from '@/hero-canvas/timeline'
import { useHeroFilm } from '@/hooks/useHeroFilm'
import { useCopy } from '@/i18n/lang'
import type { Localized } from '@/i18n/lang'
import '@/styles/film-hero.css'

interface FilmHeroProps {
  /**
   * The film's tempo (see setHeroTiming), e.g. `{ speed: 0.8 }` or
   * `{ phases: { grow: 4.5, hold: 2 } }`. Defaults to a 10.1 s loop.
   */
  timing?: HeroTiming
}

const copy: Localized<{
  headlineA: ReactNode
  headlineB: ReactNode
  subA: string
  subB: string
  cta: string
  play: string
  pause: string
  playLabel: string
  pauseLabel: string
  chapters: readonly [string, string]
  /** written along the rings, inside out */
  rings: readonly string[]
  disciplines: string
  scroll: string
}> = {
  en: {
    headlineA: (
      <>
        Brands aren't
        <br />
        built overnight.
        <br />
        <em>They're grown.</em>
      </>
    ),
    headlineB: (
      <>
        Every ring
        <br />
        <em>tells a story</em>
        <br />
        of growth.
      </>
    ),
    subA: 'Strategy. Creativity. Measurable growth.',
    subB: 'From strong roots to lasting impact.',
    cta: "Let's grow together",
    play: 'Play',
    pause: 'Pause',
    playLabel: 'Play the animation',
    pauseLabel: 'Pause the animation',
    chapters: ['01 / From seed to canopy', '02 / Rings of growth'],
    rings: ['Strategy', 'Brand', 'Engagement', 'Performance', 'A brighter tomorrow'],
    disciplines: 'Strategy / Creative / Performance',
    scroll: 'Scroll to explore',
  },
  vi: {
    headlineA: (
      <>
        Thương hiệu không
        <br />
        lớn lên sau một đêm.
        <br />
        <em>Mà được vun trồng.</em>
      </>
    ),
    headlineB: (
      <>
        Mỗi vòng gỗ
        <br />
        <em>kể một câu chuyện</em>
        <br />
        về sự trưởng thành.
      </>
    ),
    subA: 'Chiến lược. Sáng tạo. Tăng trưởng đo lường được.',
    subB: 'Từ gốc rễ vững chắc đến giá trị bền lâu.',
    cta: 'Cùng nhau phát triển',
    play: 'Phát',
    pause: 'Tạm dừng',
    playLabel: 'Phát hoạt ảnh',
    pauseLabel: 'Tạm dừng hoạt ảnh',
    chapters: ['01 / Từ hạt giống đến tán cây', '02 / Những vòng tăng trưởng'],
    rings: ['Chiến lược', 'Thương hiệu', 'Tương tác', 'Hiệu quả', 'Một ngày mai tươi sáng'],
    disciplines: 'Chiến lược / Sáng tạo / Hiệu quả',
    scroll: 'Cuộn để khám phá',
  },
}

/**
 * The living-brand hero: a seed is sown, roots spread, the tree grows, the
 * camera dives into its trunk and the growth rings open with the services.
 * Drawn live on a canvas from code (src/hero-canvas); the copy is real text
 * layered on top. The first headline is the page's h1; the second, shown
 * over the rings, is decorative and hidden from assistive tech.
 */
export const FilmHero: FC<FilmHeroProps> = ({ timing }) => {
  const t = useCopy(copy)
  const section = useRef<HTMLElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const grain = useRef<HTMLDivElement>(null)
  const headlineA = useRef<HTMLHeadingElement>(null)
  const headlineB = useRef<HTMLParagraphElement>(null)
  const subA = useRef<HTMLParagraphElement>(null)
  const subB = useRef<HTMLParagraphElement>(null)
  const fill = useRef<HTMLDivElement>(null)
  const [contactOpen, setContactOpen] = useState(false)
  const { paused, toggle, chapter } = useHeroFilm(
    { section, canvas, grain, headlineA, headlineB, subA, subB, fill },
    timing,
    t.rings
  )

  return (
    <section id="top" className="film-hero" ref={section} aria-label="Green Tree Agency">
      <canvas className="film-hero-canvas" ref={canvas} aria-hidden="true" />
      <div className="film-hero-grain" ref={grain} aria-hidden="true" />

      <div className="film-hero-copy">
        <div className="film-hero-stack">
          <h1 className="film-hero-title" ref={headlineA}>
            {t.headlineA}
          </h1>
          <p className="film-hero-title" ref={headlineB} aria-hidden="true">
            {t.headlineB}
          </p>
        </div>
        <div className="film-hero-stack">
          <p className="film-hero-sub" ref={subA}>
            {t.subA}
          </p>
          <p className="film-hero-sub" ref={subB} aria-hidden="true">
            {t.subB}
          </p>
        </div>
        <RingButton
          tone="light"
          className="film-hero-cta"
          href="#contact"
          aria-haspopup="dialog"
          onClick={(e) => {
            e.preventDefault()
            setContactOpen(true)
          }}
        >
          {t.cta}
        </RingButton>
      </div>

      <div className="film-hero-foot">
        <div className="film-hero-meta">
          <button
            type="button"
            className="film-hero-toggle"
            onClick={toggle}
            aria-pressed={paused}
            aria-label={paused ? t.playLabel : t.pauseLabel}
          >
            {paused ? t.play : t.pause}
          </button>
          <span className="film-hero-chapter">{t.chapters[chapter]}</span>
        </div>
        <div className="film-hero-track" aria-hidden="true">
          <div className="film-hero-fill" ref={fill} />
        </div>
        <div className="film-hero-labels">
          <span>{t.disciplines}</span>
          <a href="#about">{t.scroll}</a>
        </div>
      </div>

      <ContactPopup open={contactOpen} onClose={() => setContactOpen(false)} />
    </section>
  )
}
