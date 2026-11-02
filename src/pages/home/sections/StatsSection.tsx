import type { FC, ReactNode } from 'react'
import { statsByLang } from '@/data/stats'
import { useCopy } from '@/i18n/lang'
import type { Localized } from '@/i18n/lang'

const copy: Localized<{ eyebrow: string; title: ReactNode }> = {
  en: {
    eyebrow: 'Results',
    title: (
      <>
        Growth, <em className="accent-lichen">in numbers</em>
      </>
    ),
  },
  vi: {
    eyebrow: 'Kết quả',
    title: (
      <>
        Tăng trưởng <em className="accent-lichen">bằng con số</em>
      </>
    ),
  },
}

const delays = ['', 'rv-d1', 'rv-d2', 'rv-d1'] as const

export const StatsSection: FC = () => {
  const t = useCopy(copy)
  const stats = useCopy(statsByLang)
  return (
    <section id="results" className="stats">
      <div className="pad wrap stats-inner">
        <div className="stats-head">
          <h2 className="serif rv stats-title">{t.title}</h2>
          <p className="rv eyebrow eyebrow-lichen">{t.eyebrow}</p>
        </div>

        <dl className="stats-grid">
          {stats.map((s, i) => (
            <div key={s.value} className={`rv stat ${delays[i % delays.length]}`}>
              <dt className="stat-label">{s.label}</dt>
              <dd className="serif stat-value">{s.value}</dd>
              <dd className="stat-note">{s.note}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
