import { createEngine } from '../hero-engine/createEngine'

// Dev-only page: /hero-lab.html plays the film; ?t=8.6 renders one still.

const canvas = document.getElementById('c') as HTMLCanvasElement
const scrub = document.getElementById('scrub') as HTMLInputElement
const play = document.getElementById('play') as HTMLButtonElement
const label = document.getElementById('time') as HTMLSpanElement
const params = new URLSearchParams(location.search)
const still = params.get('t')

const engine = createEngine(canvas, {
  preserveDrawingBuffer: still !== null,
  onFrame: (t) => {
    scrub.value = String(t)
    label.textContent = `${t.toFixed(2)}s`
  },
})

const resize = () => engine.setSize(innerWidth, innerHeight, Math.min(devicePixelRatio, 2))
resize()
addEventListener('resize', () => {
  resize()
  if (!engine.playing) engine.renderAt(Number(scrub.value))
})

if (still !== null) {
  document.body.classList.add('still')
  engine.renderAt(Number(still))
  requestAnimationFrame(() => {
    engine.renderAt(Number(still))
    document.title = 'ready'
  })
} else {
  engine.start()
}

play.addEventListener('click', () => {
  if (engine.playing) {
    engine.stop()
    play.textContent = 'Play'
  } else {
    engine.start(Number(scrub.value))
    play.textContent = 'Pause'
  }
})
scrub.addEventListener('input', () => {
  engine.stop()
  play.textContent = 'Play'
  engine.renderAt(Number(scrub.value))
})
