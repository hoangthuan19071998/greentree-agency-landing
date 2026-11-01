import { createHeroCanvas, grainDataURL } from '../hero-canvas/createHeroCanvas'
import { CHAPTERS, DURATION, copyAt } from '../hero-canvas/timeline'

// Dev-only page: /hero-lab-2d.html plays the hero; ?t=6 renders one still.

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T
const canvas = $<HTMLCanvasElement>('c')
const scrub = $<HTMLInputElement>('scrub')
const play = $<HTMLButtonElement>('play')
const label = $<HTMLSpanElement>('time')
const els = { hA: $('hA'), hB: $('hB'), sA: $('sA'), sB: $('sB'), cta: $('cta'), fill: $('fill'), chapter: $('chapter') }
scrub.max = String(DURATION)
$('grain').style.backgroundImage = `url(${grainDataURL()})`

// write to the DOM only when a value actually changes
const last = new Map<HTMLElement, string>()
const set = (el: HTMLElement, key: 'opacity' | 'transform' | 'width', value: string) => {
  const id = key + value
  if (last.get(el) === id) return
  last.set(el, id)
  el.style[key] = value
}
const rise = (el: HTMLElement, v: number) => {
  const q = Math.round(v * 200) / 200
  if (last.get(el) === String(q)) return
  last.set(el, String(q))
  el.style.opacity = String(q)
  el.style.transform = `translate3d(0, ${((1 - q) * 14).toFixed(2)}px, 0)`
}
let chapter = -1
let frame = 0

const hero = createHeroCanvas(canvas, {
  onFrame: (t) => {
    const c = copyAt(t)
    rise(els.hA, c.headlineA)
    rise(els.hB, c.headlineB)
    rise(els.sA, c.subA)
    rise(els.sB, c.subB)
    rise(els.cta, c.cta)
    set(els.fill, 'transform', `scaleX(${c.progress.toFixed(4)})`)
    if (c.chapter !== chapter) {
      chapter = c.chapter
      els.chapter.textContent = CHAPTERS[chapter]
    }
    if (++frame % 6 === 0 || !hero.playing) {
      scrub.value = String(t)
      label.textContent = `${t.toFixed(2)}s`
    }
  },
})

// dev-only handle for profiling from the console
;(window as unknown as { __hero: typeof hero }).__hero = hero

const resize = () => hero.setSize(innerWidth, innerHeight, Math.min(devicePixelRatio, 1.5))
resize()
addEventListener('resize', () => {
  resize()
  if (!hero.playing) hero.renderAt(Number(scrub.value))
})

const params = new URLSearchParams(location.search)
const still = params.get('t')

// ?bench renders every frame of one loop at 60 fps steps and waits for the GPU
// to finish each one (createImageBitmap forces the canvas to resolve), so the
// numbers are the true cost of a frame
if (params.has('bench')) {
  const dpr = Number(params.get('dpr') ?? 1.5)
  hero.stop()
  hero.setSize(innerWidth, innerHeight, dpr)
  // ?bench=raf: real playback, intervals between animation frames
  const realtime = () =>
    new Promise<[number, number][]>((done) => {
      const marks: [number, number][] = []
      hero.start()
      const t0 = performance.now()
      let prev = t0
      const tick = (now: number) => {
        marks.push([(now - t0) / 1000, now - prev])
        prev = now
        if (now - t0 < DURATION * 1000) requestAnimationFrame(tick)
        else {
          hero.stop()
          done(marks)
        }
      }
      requestAnimationFrame(tick)
    })
  const forced = async () => {
    const marks: [number, number][] = []
    for (let i = 0; i < DURATION * 60; i++) {
      const t = i / 60
      const s = performance.now()
      hero.renderAt(t)
      ;(await createImageBitmap(canvas)).close()
      marks.push([t, performance.now() - s])
    }
    return marks
  }
  const run = async () => {
    await new Promise((r) => setTimeout(r, 1000))
    const marks = params.get('bench') === 'raf' ? await realtime() : await forced()
    const rows = [[0, 1.2], [1.2, 4.6], [4.6, 5.6], [5.6, 6.9], [6.9, 8.4], [8.4, DURATION]].map(([a, b]) => {
      const iv = marks.filter(([t]) => t >= a && t < b).map(([, d]) => d).sort((x, y) => x - y)
      return `${a.toFixed(1)}–${b.toFixed(1)}s  p50 ${iv[iv.length >> 1].toFixed(1)}ms  p95 ${iv[Math.floor(iv.length * 0.95)].toFixed(1)}ms  max ${iv[iv.length - 1].toFixed(1)}ms  >16.7ms: ${iv.filter((d) => d > 16.7).length}/${iv.length}`
    })
    const pre = document.createElement('pre')
    pre.style.cssText = 'position:fixed;inset:0;margin:0;padding:40px;background:#10221a;color:#f2f1ea;font:22px/1.6 monospace;z-index:9'
    const worst = [...marks].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([t, d]) => `t=${t.toFixed(2)} ${d.toFixed(0)}ms`)
    pre.textContent = `dpr ${dpr}  ${innerWidth}x${innerHeight}\n` + rows.join('\n') + '\nworst: ' + worst.join(', ')
    document.body.appendChild(pre)
    document.title = 'bench done'
  }
  document.fonts.ready.then(run)
} else if (still !== null) {
  document.body.classList.add('still')
  document.fonts.ready.then(() => {
    hero.renderAt(Number(still))
    document.title = 'ready'
  })
} else {
  hero.start()
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) hero.stop()
  else if (play.textContent === 'Pause') hero.start(Number(scrub.value))
})

play.addEventListener('click', () => {
  if (hero.playing) {
    hero.stop()
    play.textContent = 'Play'
  } else {
    hero.start(Number(scrub.value))
    play.textContent = 'Pause'
  }
})
scrub.addEventListener('input', () => {
  hero.stop()
  play.textContent = 'Play'
  hero.renderAt(Number(scrub.value))
})
