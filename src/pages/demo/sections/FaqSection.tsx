import { useId, useState } from 'react'
import type { FC } from 'react'

const faqs = [
  {
    q: 'How soon will we see results?',
    a: 'Paid campaigns usually show their first reliable signals within two to four weeks, once the platforms have learned who converts. Brand, content and SEO compound more slowly: expect clear movement over three to six months.',
  },
  {
    q: 'Do you lock clients into long contracts?',
    a: 'No. We start with an onboarding period to lay the roots, then work month to month. We would rather keep you because the numbers are growing than because a contract says so.',
  },
  {
    q: 'Which channels do you run?',
    a: 'Meta, Google and TikTok ads, content and social, landing pages and conversion tracking, plus SEO and analytics. We recommend only the channels that fit your audience and budget.',
  },
  {
    q: 'Who owns the ad accounts and the data?',
    a: 'You do. Ad accounts, pixels, analytics and creative stay in your business name, and we work inside them with partner access. If we ever part ways, everything stays with you.',
  },
  {
    q: 'How do you report on performance?',
    a: 'A live dashboard you can open any time, a short weekly update and a monthly review call. We report on revenue, leads and cost per result, not vanity metrics.',
  },
  {
    q: 'How is pricing worked out?',
    a: 'It depends on scope: the channels, the volume of content and the ad spend we manage. After a free discovery call we send a fixed monthly proposal, so there are no surprises.',
  },
  {
    q: 'Do you work with brands outside Da Nang?',
    a: 'Yes. Our studio is in Da Nang, but we work with brands across Vietnam and run most of the collaboration remotely, with on-site shoots when a project needs them.',
  },
] as const

/**
 * F.A.Q: three oversized serif letters spread across the row with small
 * captions between them, then a numbered accordion. One answer is open at a
 * time; each question is a button wired to its panel with aria-expanded.
 */
export const FaqSection: FC = () => {
  const [open, setOpen] = useState<number | null>(0)
  const uid = useId()

  return (
    <section id="faq" className="faq">
      <div className="pad wrap faq-inner">
        <h2 className="rv faq-head" aria-label="Frequently asked questions">
          <span className="serif faq-letter" aria-hidden="true">F</span>
          <span className="faq-caption" aria-hidden="true">
            Answers to
            <br />
            key questions
          </span>
          <span className="serif faq-letter" aria-hidden="true">A</span>
          <span className="faq-caption" aria-hidden="true">
            All you need
            <br />
            to know
          </span>
          <span className="serif faq-letter" aria-hidden="true">Q</span>
        </h2>

        <ul className="rv rv-d1 faq-list">
          {faqs.map((f, i) => {
            const isOpen = open === i
            const btn = `${uid}-q${i}`
            const panel = `${uid}-a${i}`
            return (
              <li key={f.q} className={isOpen ? 'faq-item is-open' : 'faq-item'}>
                <h3 className="faq-q">
                  <button
                    type="button"
                    id={btn}
                    className="faq-btn"
                    aria-expanded={isOpen}
                    aria-controls={panel}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    <span className="faq-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                    <span className="faq-text">{f.q}</span>
                    <span className="faq-plus" aria-hidden="true" />
                  </button>
                </h3>
                <div id={panel} className="faq-panel" role="region" aria-labelledby={btn}>
                  <div className="faq-panel-inner">
                    <p className="faq-a">{f.a}</p>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
