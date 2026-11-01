import type { FC } from 'react'
import { RingButton } from '@/components/RingButton'
import { RingIcon } from '@/components/RingIcon'
import { CONTACT, LOGO } from '@/config/site'

export const ContactSection: FC = () => (
  <section id="contact" className="contact">
    <div className="pad wrap contact-inner">
      <p className="rv eyebrow eyebrow-lichen">04 {'—'} Get in touch</p>

      <h2 className="serif big rv contact-title">
        Let's plant
        <br />
        <em className="accent-lichen">the seed together.</em>
      </h2>

      <div className="rv rv-d1 contact-row">
        <div className="contact-cta-wrap">
          <RingButton
            tone="light"
            href={CONTACT.phoneHref}
            aria-label={`Call ${CONTACT.phone}`}
          >
            Book a call
          </RingButton>
        </div>

        <div className="contact-links">
          <a href={`mailto:${CONTACT.email}`} className="serif contact-link contact-email">
            {CONTACT.email}
          </a>
          <a href={CONTACT.phoneHref} className="serif contact-link contact-phone">
            [{CONTACT.phone}]
          </a>
        </div>
      </div>
    </div>

    <footer className="pad wrap site-footer">
      <div className="footer-brand">
        <span className="footer-logo">
          <img src={LOGO(64)} alt="Green Tree Agency" width="20" height="20" />
        </span>
        <span>
          {'©'} 2026 Green Tree Agency. Hotline:{' '}
          <a className="footer-link" href={CONTACT.phoneHref}>
            {CONTACT.phone}
          </a>
        </span>
      </div>
      <a className="ring-link back-top" href="#top">
        Back to top{' '}
        <span className="back-top-icon">
          <RingIcon size={22} strokeWidth={4.5} />
        </span>
      </a>
    </footer>
  </section>
)
