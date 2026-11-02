import type { FC } from 'react'
import { RingButton } from '@/components/RingButton'
import { CONTACT } from '@/config/site'

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
  </section>
)
