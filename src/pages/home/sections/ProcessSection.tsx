import type { FC } from 'react'
import { processSteps } from '@/data/process'

export const ProcessSection: FC = () => (
  <section id="process" className="process">
    <div className="pad wrap process-inner">
      <div className="process-head">
        <h2 className="serif rv process-title">
          The <em className="accent-lichen">G.R.E.E.N.</em> process
        </h2>
        <p className="rv eyebrow eyebrow-lichen">03 {'—'} How we work</p>
      </div>

      <div className="process-grid">
        {processSteps.map((p) => (
          <div key={p.num} className={`rv process-card ${p.delay}`}>
            <div className="process-letter">
              <span className="serif process-glyph">{p.letter}</span>
            </div>
            <div className="process-body">
              <span className="process-step">Step {p.num}</span>
              <h3 className="serif process-name">{p.name}</h3>
              <p className="process-desc">{p.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
)
