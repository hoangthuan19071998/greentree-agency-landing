import type { FC, ReactNode } from 'react'
import { LOGO } from '@/config/site'
import { useCopy } from '@/i18n/lang'
import type { Localized } from '@/i18n/lang'

const copy: Localized<{ alt: string; quote: ReactNode }> = {
  en: {
    alt: 'Green Tree Agency Emblem',
    quote: (
      <>
        {'“'}Good brands, like good trees, are <em className="accent-moss">grown</em>
        {' — '}not just built.{'”'}
      </>
    ),
  },
  vi: {
    alt: 'Biểu tượng Green Tree Agency',
    quote: (
      <>
        {'“'}Thương hiệu tốt, như một cái cây tốt, được{' '}
        <em className="accent-moss">vun trồng</em>
        {' — '}chứ không chỉ được xây lên.{'”'}
      </>
    ),
  },
}

export const QuoteSection: FC = () => {
  const t = useCopy(copy)
  return (
    <section className="pad wrap quote">
      <img
        className="rv quote-mark"
        src={LOGO(256)}
        alt={t.alt}
        width="72"
        height="72"
      />
      <p className="serif big rv quote-text">{t.quote}</p>
    </section>
  )
}
