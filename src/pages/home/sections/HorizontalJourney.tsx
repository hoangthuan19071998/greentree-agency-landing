import type { CSSProperties, FC, ReactNode } from 'react'
import { RingButton } from '@/components/RingButton'
import { servicesByLang } from '@/data/services'
import type { Service } from '@/data/services'
import type { JourneyRefs } from '@/hooks/useScrollScene'
import { useCopy } from '@/i18n/lang'
import type { Localized } from '@/i18n/lang'

interface HorizontalJourneyProps {
  journey: JourneyRefs
}

const copy: Localized<{
  aboutEyebrow: string
  aboutBar: string
  statement: ReactNode
  lede: string
  note: string
  book: string
  imgAlt: string
  badge: string
  servicesEyebrow: string
  servicesBar: string
  servicesTitle: ReactNode
  servicesLede: string
}> = {
  en: {
    aboutEyebrow: '01 — Who we are',
    aboutBar: '01 Who we are',
    statement: (
      <>
        We're a performance-led digital agency in Da Nang that grows brands the way trees grow
        {' — '}
        <em className="accent-moss">patiently, from the roots up.</em>
      </>
    ),
    lede: 'Every campaign starts below the surface: understanding your audience, your market and what growth actually means for your business. Then we plant the right channels and tend them until they bear fruit.',
    note: 'Clear process. Measurable results. Honest reporting. Always curious.',
    book: 'Book a call',
    imgAlt: 'Green Tree Agency Studio Collaboration',
    badge: 'Da Nang Studio • Est. 2026',
    servicesEyebrow: '02 — Services',
    servicesBar: '02 Services',
    servicesTitle: (
      <>
        What we <em className="accent-moss">grow</em>
      </>
    ),
    servicesLede: 'Five disciplines, one root system. Each one feeds the others.',
  },
  vi: {
    aboutEyebrow: '01 — Về chúng tôi',
    aboutBar: '01 Về chúng tôi',
    statement: (
      <>
        Chúng tôi là agency digital tại Đà Nẵng, tập trung vào hiệu quả, nuôi lớn thương hiệu như
        cách một cái cây lớn lên{' — '}
        <em className="accent-moss">kiên nhẫn, từ gốc rễ.</em>
      </>
    ),
    lede: 'Mọi chiến dịch đều bắt đầu từ bên dưới bề mặt: thấu hiểu khách hàng, thị trường và tăng trưởng thực sự có ý nghĩa gì với doanh nghiệp của bạn. Rồi chúng tôi gieo đúng kênh và chăm sóc cho đến khi đơm hoa kết trái.',
    note: 'Quy trình rõ ràng. Kết quả đo lường được. Báo cáo minh bạch. Luôn tò mò.',
    book: 'Đặt lịch tư vấn',
    imgAlt: 'Đội ngũ Green Tree Agency làm việc tại studio',
    badge: 'Studio Đà Nẵng • Thành lập 2026',
    servicesEyebrow: '02 — Dịch vụ',
    servicesBar: '02 Dịch vụ',
    servicesTitle: (
      <>
        Điều chúng tôi <em className="accent-moss">vun trồng</em>
      </>
    ),
    servicesLede: 'Năm lĩnh vực, chung một bộ rễ. Lĩnh vực này nuôi dưỡng lĩnh vực kia.',
  },
}

/**
 * Who we are + Services. On roomy desktops the track is pinned and scrolled
 * sideways by useScrollScene; elsewhere the same panels stack vertically.
 */
export const HorizontalJourney: FC<HorizontalJourneyProps> = ({
  journey: { sectionRef, pinRef, trackRef, progressRef },
}) => {
  const t = useCopy(copy)
  const services = useCopy(servicesByLang)
  return (
    <section id="journey" className="hz" ref={sectionRef}>
      <div className="hz-pin" ref={pinRef}>
        <div className="hz-track" ref={trackRef}>
          <AboutPanel />
          <ServicesIntroPanel />
          {services.map((s) => (
            <ServiceCard key={s.num} service={s} total={services.length} />
          ))}
          <div className="hz-panel hz-end" />
        </div>

        <div className="hz-bar pad">
          <span>{t.aboutBar}</span>
          <span className="hz-bar-track">
            <span className="hz-progress" ref={progressRef} />
          </span>
          <span>{t.servicesBar}</span>
        </div>
      </div>
    </section>
  )
}

const AboutPanel: FC = () => {
  const t = useCopy(copy)
  return (
    <div id="about" className="hz-panel pad p-about">
      <p className="eyebrow">{t.aboutEyebrow}</p>
      <p className="serif big about-statement">{t.statement}</p>
      <div className="two-col about-split">
        <div className="about-copy">
          <p className="about-lede">{t.lede}</p>
          <p className="about-note">{t.note}</p>
          <div className="about-cta">
            <RingButton tone="dark" href="#contact">
              {t.book}
            </RingButton>
          </div>
        </div>

        <div className="about-img-box">
          <img
            src="/images/about-studio-collab.jpg"
            alt={t.imgAlt}
            loading="lazy"
            decoding="async"
          />
          <div className="about-badge">
            <span className="about-badge-dot" />
            <span>{t.badge}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const ServicesIntroPanel: FC = () => {
  const t = useCopy(copy)
  return (
    <div id="services" className="hz-panel pad p-intro">
      <p className="eyebrow">{t.servicesEyebrow}</p>
      <div className="intro-body">
        <h2 className="serif intro-title">{t.servicesTitle}</h2>
        <p className="intro-lede">{t.servicesLede}</p>
      </div>
      {/* Empty third row keeps the title vertically centred in the pinned panel */}
      <p className="hz-only" />
    </div>
  )
}

// Parallax rings drawn over each card photo: [cx, cy, r]
const cardRings = [
  [420, 220, 240],
  [410, 228, 176],
  [424, 214, 112],
  [416, 222, 52],
] as const

const ServiceCard: FC<{ service: Service; total: number }> = ({ service: s, total }) => {
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
              {s.num} / {String(total).padStart(2, '0')}
            </span>
            <span className="card-kicker">{s.kicker}</span>
          </div>
          <h3 className="serif card-title">{s.title}</h3>
          <p className="card-desc">{s.desc}</p>
          <div className="card-tags">
            {s.tags.map((tag) => (
              <span key={tag} className="card-tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </article>
    </div>
  )
}
