import type { CSSProperties, FC } from 'react'
import { RingButton } from '../components/RingButton'
import { services } from '../data/services'
import type { Service } from '../data/services'
import type { JourneyRefs } from '../hooks/useScrollScene'

interface HorizontalJourneyProps {
  journey: JourneyRefs
}

/**
 * Who we are + Services. On roomy desktops the track is pinned and scrolled
 * sideways by useScrollScene; elsewhere the same panels stack vertically.
 */
export const HorizontalJourney: FC<HorizontalJourneyProps> = ({
  journey: { sectionRef, pinRef, trackRef, progressRef },
}) => (
  <section id="journey" className="hz" ref={sectionRef}>
    <div className="hz-pin" ref={pinRef}>
      <div className="hz-track" ref={trackRef}>
        <AboutPanel />
        <ServicesIntroPanel />
        {services.map((s) => (
          <ServiceCard key={s.num} service={s} />
        ))}
        <div className="hz-panel hz-end" />
      </div>

      <div className="hz-bar pad">
        <span>01 Who we are</span>
        <span className="hz-bar-track">
          <span className="hz-progress" ref={progressRef} />
        </span>
        <span>02 Services</span>
      </div>
    </div>
  </section>
)

const AboutPanel: FC = () => (
  <div id="about" className="hz-panel pad p-about">
    <p className="eyebrow">01 {'—'} Who we are</p>
    <p className="serif big about-statement">
      We're a performance-led digital agency in Da Nang that grows brands the
      way trees grow {'—'}{' '}
      <em className="accent-moss">patiently, from the roots up.</em>
    </p>
    <div className="two-col about-split">
      <div className="about-copy">
        <p className="about-lede">
          Every campaign starts below the surface: understanding your audience,
          your market and what growth actually means for your business. Then we
          plant the right channels and tend them until they bear fruit.
        </p>
        <p className="about-note">
          Clear process. Measurable results. Honest reporting. Always curious.
        </p>
        <div className="about-cta">
          <RingButton tone="dark" href="#contact">
            Book a call
          </RingButton>
        </div>
      </div>

      <div className="about-img-box">
        <img
          src="/images/about-studio-collab.jpg"
          alt="Green Tree Agency Studio Collaboration"
          loading="lazy"
          decoding="async"
        />
        <div className="about-badge">
          <span className="about-badge-dot" />
          <span>Da Nang Studio &bull; Est. 2026</span>
        </div>
      </div>
    </div>
  </div>
)

const ServicesIntroPanel: FC = () => (
  <div id="services" className="hz-panel pad p-intro">
    <p className="eyebrow">02 {'—'} Services</p>
    <div className="intro-body">
      <h2 className="serif intro-title">
        What we <em className="accent-moss">grow</em>
      </h2>
      <p className="intro-lede">
        Five disciplines, one root system. Each one feeds the others.
      </p>
    </div>
    {/* Empty third row keeps the title vertically centred in the pinned panel */}
    <p className="hz-only" />
  </div>
)

// Parallax rings drawn over each card photo: [cx, cy, r]
const cardRings = [
  [420, 220, 240],
  [410, 228, 176],
  [424, 214, 112],
  [416, 222, 52],
] as const

const ServiceCard: FC<{ service: Service }> = ({ service: s }) => {
  const tone = {
    '--card-bg': s.tone.bg,
    '--card-fg': s.tone.fg,
    '--card-ph': s.tone.ph,
    '--card-line': s.tone.line,
  } as CSSProperties

  return (
    <div className="hz-panel p-card">
      <article className="service-card" style={tone}>
        <div className="ph">
          <img
            className="service-img"
            src={s.image}
            alt={s.title}
            loading="lazy"
            decoding="async"
          />
          <div className="service-overlay" />
          <svg
            className="hz-par"
            viewBox="0 0 600 400"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            {cardRings.map(([cx, cy, r]) => (
              <circle key={r} cx={cx} cy={cy} r={r} />
            ))}
          </svg>
        </div>
        <div className="card-body">
          <div className="card-meta">
            <span>
              {s.num} / {String(services.length).padStart(2, '0')}
            </span>
            <span className="card-kicker">{s.kicker}</span>
          </div>
          <h3 className="serif card-title">{s.title}</h3>
          <p className="card-desc">{s.desc}</p>
          <div className="card-tags">
            {s.tags.map((t) => (
              <span key={t} className="card-tag">
                {t}
              </span>
            ))}
          </div>
        </div>
      </article>
    </div>
  )
}
