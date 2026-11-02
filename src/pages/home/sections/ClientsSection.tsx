import type { FC } from 'react'
import { clientLogos } from '@/data/work'
import { useCopy } from '@/i18n/lang'
import type { Localized } from '@/i18n/lang'

const copy: Localized<{ eyebrow: string }> = {
  en: { eyebrow: 'Trusted by brands across Da Nang' },
  vi: { eyebrow: 'Được tin chọn bởi các thương hiệu tại Đà Nẵng' },
}

/** A quiet row of client logos straight after the hero. */
export const ClientsSection: FC = () => {
  const t = useCopy(copy)
  return (
    <section className="pad wrap clients" aria-labelledby="clients-title">
      <p id="clients-title" className="rv eyebrow clients-eyebrow">
        {t.eyebrow}
      </p>
      <ul className="rv rv-d1 clients-list">
        {clientLogos.map((c) => (
          <li key={c.id} className="client-logo">
            <img src={c.logo} alt={c.client} loading="lazy" decoding="async" />
          </li>
        ))}
      </ul>
    </section>
  )
}
