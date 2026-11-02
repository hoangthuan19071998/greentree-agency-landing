import type { CSSProperties, FC } from 'react'
import { RingIcon } from '@/components/RingIcon'
import { COMPANY_PROFILE, CONTACT, LOGO, SECTION_LINKS } from '@/config/site'

/** Strand heights for the grain band, 0..1, traced like wood grain. */
const STRANDS = Array.from({ length: 160 }, (_, i) => {
  const jitter = Math.sin(i * 127.1 + 311.7) * 43758.5453
  const v =
    0.55 +
    0.2 * Math.sin(i * 0.13) +
    0.12 * Math.sin(i * 0.41 + 1.3) +
    (jitter - Math.floor(jitter) - 0.5) * 0.35
  return Math.max(0.12, Math.min(1, v))
})

/**
 * Closing footer: studio details on either side of the mark, the phone and
 * e-mail set large across the page, a striped tree-ring emblem between them
 * and a band of wood-grain strands rising along the bottom edge.
 */
export const SiteFooter: FC = () => (
  <footer className="sfoot">
    <div className="pad wrap sfoot-inner">
      <div className="sfoot-top">
        <div className="sfoot-col">
          <p className="sfoot-label">Studio</p>
          <p className="sfoot-text">
            Da Nang, Vietnam
            <br />
            Working with brands nationwide
          </p>
        </div>

        <a className="sfoot-brand" href="#top" aria-label="Green Tree Agency, back to top">
          <img src={LOGO(128)} alt="" width="40" height="40" />
          <span className="serif">Green Tree</span>
        </a>

        <nav className="sfoot-col sfoot-col-end" aria-label="Footer">
          <p className="sfoot-label">Explore</p>
          <ul className="sfoot-nav">
            {SECTION_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
            <li>
              <a href="#faq">FAQ</a>
            </li>
            <li>
              <a
                href={COMPANY_PROFILE.href}
                target="_blank"
                rel="noopener"
                aria-label={COMPANY_PROFILE.ariaLabel}
              >
                {COMPANY_PROFILE.label}
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="sfoot-stage">
        <div className="sfoot-emblem" aria-hidden="true">
          <RingIcon size={320} strokeWidth={2.2} />
        </div>
        <a className="sfoot-big" href={CONTACT.phoneHref} aria-label={`Call ${CONTACT.phone}`}>
          {CONTACT.phone}
        </a>
        <a className="sfoot-big sfoot-big-end" href={`mailto:${CONTACT.email}`}>
          {CONTACT.email}
        </a>
      </div>

      <div className="sfoot-bar">
        <span>{'©'} 2026 Green Tree Agency</span>
        <span className="sfoot-motto">Grown, not just built.</span>
        <a href="#top">Back to top {'↑'}</a>
      </div>
    </div>

    <div className="sfoot-grain" aria-hidden="true">
      {STRANDS.map((h, i) => (
        <span key={i} style={{ '--h': h } as CSSProperties} />
      ))}
    </div>
  </footer>
)
