import type { FC, ReactNode } from 'react'
import { processStepsByLang } from '@/data/process'
import { useCopy } from '@/i18n/lang'
import type { Localized } from '@/i18n/lang'

const copy: Localized<{ title: ReactNode; eyebrow: string; step: string }> = {
  en: {
    title: (
      <>
        The <em className="accent-lichen">G.R.E.E.N.</em> process
      </>
    ),
    eyebrow: '03 — How we work',
    step: 'Step',
  },
  vi: {
    title: (
      <>
        Quy trình <em className="accent-lichen">G.R.E.E.N.</em>
      </>
    ),
    eyebrow: '03 — Cách chúng tôi làm việc',
    step: 'Bước',
  },
}

export const ProcessSection: FC = () => {
  const t = useCopy(copy)
  const steps = useCopy(processStepsByLang)
  return (
    <section id="process" className="process">
      <div className="pad wrap process-inner">
        <div className="process-head">
          <h2 className="serif rv process-title">{t.title}</h2>
          <p className="rv eyebrow eyebrow-lichen">{t.eyebrow}</p>
        </div>

        <div className="process-grid">
          {steps.map((p) => (
            <div key={p.num} className={`rv process-card ${p.delay}`}>
              <div className="process-letter">
                <span className="serif process-glyph">{p.letter}</span>
              </div>
              <div className="process-body">
                <span className="process-step">
                  {t.step} {p.num}
                  {p.gloss && ` · ${p.gloss}`}
                </span>
                <h3 className="serif process-name">{p.name}</h3>
                <p className="process-desc">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
