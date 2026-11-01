// THROWAWAY concept mock-ups for review (?c=1..5). Renders real engine frames
// and paints the proposed additions on top. Not part of the hero.
import { createHeroCanvas } from '../hero-canvas/createHeroCanvas'
import { TAU, mulberry32 } from '../hero-engine/math'

const W = 1440
const H = 810
const out = document.getElementById('out') as HTMLCanvasElement
out.width = W
out.height = H
const c = out.getContext('2d')!
const LICHEN = '201, 216, 176'
const GROUND = '#10221a'

const frame = (t: number, scale = 1) => {
  const cv = document.createElement('canvas')
  const e = createHeroCanvas(cv)
  e.setSize(W * scale, H * scale, 1)
  e.renderAt(t)
  return cv
}

const label = (text: string, x: number, y: number, size = 13, colour = `rgba(${LICHEN}, .85)`, spacing = '0.18em') => {
  c.font = `500 ${size}px Manrope`
  c.letterSpacing = spacing
  c.fillStyle = colour
  c.fillText(text.toUpperCase(), x, y)
  c.letterSpacing = '0px'
}

const headline = (lines: [string, boolean][], x: number, y: number, size: number) => {
  lines.forEach(([text, italic], i) => {
    c.font = `${italic ? 'italic ' : ''}400 ${size}px "Cormorant Garamond"`
    c.fillStyle = italic ? '#c9d8b0' : '#f2f1ea'
    c.fillText(text, x, y + i * size * 1.04)
  })
}

const tag = (text: string) => {
  c.fillStyle = 'rgba(16, 34, 26, .85)'
  c.fillRect(24, 22, c.measureText(text).width + 260, 34)
  label(`Concept · ${text}`, 36, 44, 12, '#f2f1ea')
}

function diamond(x: number, y: number, s: number, a: number) {
  const ca = Math.cos(a)
  const sa = Math.sin(a)
  c.moveTo(x - sa * s, y + ca * s)
  c.lineTo(x + ca * s * 0.55, y + sa * s * 0.55)
  c.lineTo(x + sa * s, y - ca * s)
  c.lineTo(x - ca * s * 0.55, y - sa * s * 0.55)
  c.closePath()
}

function tube(x0: number, y0: number, cx: number, cy: number, x1: number, y1: number, w: number) {
  const p = new Path2D()
  p.moveTo(x0, y0)
  p.quadraticCurveTo(cx, cy, x1, y1)
  c.lineCap = 'round'
  c.strokeStyle = `rgba(${LICHEN}, .05)`
  c.lineWidth = w * 2.4
  c.stroke(p)
  c.strokeStyle = 'rgba(190, 214, 172, .92)'
  c.lineWidth = w
  c.stroke(p)
  if (w > 3) {
    c.strokeStyle = 'rgba(78, 122, 88, .85)'
    c.lineWidth = w * 0.42
    c.stroke(p)
  }
}

/** a root network fanning down from (x, y) */
function roots(x: number, y: number, len: number, depth: number, angle: number, w: number, rnd: () => number) {
  const x1 = x + Math.sin(angle) * len
  const y1 = y + Math.cos(angle) * len
  const bend = (rnd() - 0.5) * len * 0.5
  c.strokeStyle = `rgba(${LICHEN}, ${0.25 + 0.5 * (w / 3)})`
  c.lineWidth = w
  c.beginPath()
  c.moveTo(x, y)
  c.quadraticCurveTo((x + x1) / 2 + bend, (y + y1) / 2, x1, y1)
  c.stroke()
  if (depth > 0) {
    const n = rnd() < 0.4 ? 3 : 2
    for (let i = 0; i < n; i++) roots(x1, y1, len * (0.62 + rnd() * 0.2), depth - 1, angle + (i - (n - 1) / 2) * 0.7 + (rnd() - 0.5) * 0.4, Math.max(0.6, w * 0.65), rnd)
  }
}

function soil(groundY: number, rnd: () => number) {
  const g = c.createLinearGradient(0, groundY, 0, H)
  g.addColorStop(0, 'rgba(10, 22, 16, 0.55)')
  g.addColorStop(1, 'rgba(6, 14, 10, 0.9)')
  c.fillStyle = g
  c.fillRect(0, groundY, W, H - groundY)
  // strata
  for (let k = 0; k < 4; k++) {
    const y = groundY + 40 + k * 55
    c.strokeStyle = `rgba(${LICHEN}, ${0.07 - k * 0.012})`
    c.lineWidth = 1
    c.beginPath()
    for (let x = 0; x <= W; x += 24) c.lineTo(x, y + Math.sin(x * 0.006 + k * 2) * 8)
    c.stroke()
  }
  // grains
  c.fillStyle = `rgba(${LICHEN}, 0.18)`
  c.beginPath()
  for (let i = 0; i < 520; i++) {
    const x = rnd() * W
    const y = groundY + 6 + Math.pow(rnd(), 0.7) * (H - groundY)
    const r = 0.5 + rnd() * 1.4
    c.moveTo(x + r, y)
    c.arc(x, y, r, 0, TAU)
  }
  c.fill()
  // ground line, full width
  c.strokeStyle = `rgba(${LICHEN}, 0.4)`
  c.beginPath()
  c.moveTo(0, groundY)
  c.lineTo(W, groundY)
  c.stroke()
}

/** opening, close-up: the engine rendered 3x and cropped around the seed */
function opening(t: number, rootsDepth: number, caption: string, s = 3) {
  const big = frame(t, s)
  const bx = 0.726 * W * s
  const by = 0.84 * H * s
  const ox = bx - 0.6 * W
  const oy = by - 0.6 * H
  c.drawImage(big, ox, oy, W, H, 0, 0, W, H)
  const rnd = mulberry32(5)
  soil(0.6 * H, rnd)
  // tiny grass blades along the ground
  c.strokeStyle = `rgba(${LICHEN}, 0.45)`
  c.lineWidth = 1.2
  for (let i = 0; i < 26; i++) {
    const x = 0.6 * W + (rnd() - 0.5) * W * 0.9
    if (Math.abs(x - 0.6 * W) < 40) continue
    const h = 8 + rnd() * 22
    c.beginPath()
    c.moveTo(x, 0.6 * H)
    c.quadraticCurveTo(x + (rnd() - 0.5) * 10, 0.6 * H - h * 0.6, x + (rnd() - 0.5) * 14, 0.6 * H - h)
    c.stroke()
  }
  if (rootsDepth > 0) {
    const r2 = mulberry32(8)
    for (let i = 0; i < 5; i++) roots(0.6 * W, 0.6 * H + 4, 60 + r2() * 30, rootsDepth, (i / 4 - 0.5) * 2.2, 3, r2)
  }
  label('01 — The seed', 0.075 * W, 0.2 * H, 13)
  c.font = 'italic 400 34px "Cormorant Garamond"'
  c.fillStyle = 'rgba(242, 241, 234, .75)'
  c.fillText(caption, 0.075 * W, 0.2 * H + 46)
}

function lushTree() {
  c.drawImage(frame(7.6), 0, 0)
  const bx = 0.726 * W
  const by = 0.84 * H
  const u = H
  const rnd = mulberry32(12)
  // B: back canopy — darker, larger leaves, lower and wider than the crown
  const back = ['rgba(52, 92, 66, .9)', 'rgba(62, 104, 76, .9)', 'rgba(44, 80, 58, .9)']
  for (let i = 0; i < 900; i++) {
    const a = Math.PI + rnd() * Math.PI
    const r = Math.sqrt(rnd())
    const x = bx + Math.cos(a) * r * 0.42 * u
    const y = by - 0.5 * u - Math.sin(a) * r * 0.18 * u + 0.12 * u * r
    if (Math.abs(x - bx) < 0.03 * u) continue
    c.fillStyle = back[i % 3]
    c.beginPath()
    diamond(x, y, 0.009 * u + rnd() * 0.006 * u, rnd() * TAU)
    c.fill()
  }
  // A: low limbs from the trunk, reaching out and drooping
  const limbs: [number, number, number][] = [
    [0.17, -1, 0.21],
    [0.2, 1, 0.23],
    [0.13, -1, 0.15],
    [0.15, 1, 0.16],
  ]
  for (const [h, side, reach] of limbs) {
    const x0 = bx
    const y0 = by - h * u
    const x1 = bx + side * reach * u
    const y1 = y0 - 0.02 * u
    tube(x0, y0, bx + side * reach * 0.5 * u, y0 - 0.09 * u, x1, y1, 0.0045 * u)
    tube(x1 - side * 0.05 * u, y1 - 0.03 * u, x1, y1 - 0.08 * u, x1 + side * 0.04 * u, y1 - 0.06 * u, 0.0025 * u)
    const cols = ['#b7cfa2', '#93b98a', '#6f9a6e', '#4e7c5c']
    for (let i = 0; i < 120; i++) {
      const k = Math.pow(rnd(), 0.6)
      const x = x0 + (x1 - x0) * (0.35 + 0.75 * k) + (rnd() - 0.5) * 0.08 * u
      const y = y1 - 0.06 * u * (1 - k) + (rnd() - 0.4) * 0.07 * u
      c.fillStyle = cols[i % 4]
      c.globalAlpha = 0.9
      c.beginPath()
      diamond(x, y, 0.006 * u + rnd() * 0.007 * u, rnd() * TAU)
      c.fill()
    }
    c.globalAlpha = 1
  }
  // C: a few leaves drifting down
  for (const [x, y, a] of [[0.62, 0.62, 0.4], [0.66, 0.74, 1.6], [0.84, 0.66, 2.4], [0.88, 0.8, 0.9], [0.8, 0.55, 1.1]]) {
    c.fillStyle = '#93b98a'
    c.globalAlpha = 0.75
    c.beginPath()
    diamond(x * W, y * H, 0.009 * u, a)
    c.fill()
  }
  c.globalAlpha = 1
  // D: undergrowth at the base
  c.strokeStyle = `rgba(${LICHEN}, .5)`
  c.lineWidth = 1.1
  for (let i = 0; i < 70; i++) {
    const x = bx + (rnd() - 0.5) * 0.5 * u
    const h = (6 + rnd() * 20) * (1 - Math.abs(x - bx) / (0.3 * u))
    if (h < 3) continue
    c.beginPath()
    c.moveTo(x, by)
    c.quadraticCurveTo(x + (rnd() - 0.5) * 8, by - h * 0.6, x + (rnd() - 0.5) * 12, by - h)
    c.stroke()
  }
  headline([["Brands aren't", false], ['built overnight.', false], ["They're grown.", true]], 0.075 * W, 0.4 * H, 0.067 * W)
}

function ringLabels() {
  c.drawImage(frame(13.8), 0, 0)
  const cx = 0.75 * W
  const cy = 0.52 * H
  const R = (i: number) => H * (0.045 + i * 0.043 * (1 + i * 0.014))
  // B: a soft wave of light travelling outward through the rings
  const wave = R(6)
  const g = c.createRadialGradient(cx, cy, wave - 34, cx, cy, wave + 34)
  g.addColorStop(0, `rgba(${LICHEN}, 0)`)
  g.addColorStop(0.5, `rgba(${LICHEN}, .22)`)
  g.addColorStop(1, `rgba(${LICHEN}, 0)`)
  c.fillStyle = g
  c.beginPath()
  c.arc(cx, cy, wave + 34, 0, TAU)
  c.arc(cx, cy, Math.max(0, wave - 34), 0, TAU, true)
  c.fill()
  // A: each service written along its own ring, read outward from the heart
  const items: [string, number, number][] = [
    ['Strategy', 1, -1.75],
    ['Brand', 3, -1.15],
    ['Engagement', 5, -0.6],
    ['Performance', 8, -2.45],
    ['A brighter tomorrow', 11, -2.85],
  ]
  c.font = 'italic 400 21px "Cormorant Garamond"'
  for (const [text, i, start] of items) {
    const r = R(i) - 7
    // dark backing along the arc keeps the words legible over the lines
    const span = c.measureText(text).width / r
    c.strokeStyle = 'rgba(16, 34, 26, .85)'
    c.lineWidth = 26
    c.lineCap = 'round'
    c.beginPath()
    c.arc(cx, cy, r + 6, start - 0.02, start + span + 0.02)
    c.stroke()
    let a = start
    c.fillStyle = '#f2f1ea'
    for (const ch of text) {
      const w = c.measureText(ch).width
      c.save()
      c.translate(cx + Math.cos(a + w / r / 2) * r, cy + Math.sin(a + w / r / 2) * r)
      c.rotate(a + w / r / 2 + Math.PI / 2)
      c.fillText(ch, -w / 2, 0)
      c.restore()
      a += w / r
    }
    // a small mark where the word begins
    c.fillStyle = '#c9d8b0'
    c.beginPath()
    c.arc(cx + Math.cos(start - 0.05) * (r + 6), cy + Math.sin(start - 0.05) * (r + 6), 2.5, 0, TAU)
    c.fill()
  }
  headline([['Every ring', false], ['tells a story', true], ['of growth.', false]], 0.075 * W, 0.4 * H, 0.067 * W)
}

function loopStrip() {
  c.fillStyle = GROUND
  c.fillRect(0, 0, W, H)
  const pw = W / 3
  const ph = H / 3
  const y0 = (H - ph) / 2
  const rings = frame(13.8)
  const dot = (cx: number, cy: number, r: number) => {
    const g = c.createRadialGradient(cx, cy, 0, cx, cy, r)
    g.addColorStop(0, `rgba(${LICHEN}, .95)`)
    g.addColorStop(0.25, `rgba(${LICHEN}, .5)`)
    g.addColorStop(1, `rgba(${LICHEN}, 0)`)
    c.fillStyle = g
    c.fillRect(cx - r, cy - r, r * 2, r * 2)
  }
  /** the rings image shrunk by k toward its own heart, inside a panel */
  const shrunk = (x: number, k: number, alpha: number) => {
    const cx = x + 0.75 * pw
    const cy = y0 + 0.52 * ph
    c.save()
    c.beginPath()
    c.rect(x, y0, pw, ph)
    c.clip()
    c.fillStyle = GROUND
    c.fillRect(x, y0, pw, ph)
    // a round window so the shrunk frame shows rings, not its own edges
    c.beginPath()
    c.arc(cx, cy, ph * 0.62 * k, 0, TAU)
    c.clip()
    c.globalAlpha = alpha
    c.drawImage(rings, cx - 0.75 * pw * k, cy - 0.52 * ph * k, pw * k, ph * k)
    c.restore()
    return [cx, cy]
  }
  const panels: [string, (x: number) => void][] = [
    ['1 · The rings draw back in', (x) => {
      shrunk(x, 0.55, 0.9)
    }],
    ['2 · …to one point of light', (x) => {
      const [cx, cy] = shrunk(x, 0.12, 0.5)
      dot(cx, cy, 30)
    }],
    ['3 · …that falls as the next seed', (x) => {
      c.drawImage(frame(0.8), 0, 0, W, H, x, y0, pw, ph)
      dot(x + 0.726 * pw, y0 + 0.5 * ph, 16)
    }],
  ]
  panels.forEach(([text, draw], k) => {
    const x = k * pw
    draw(x)
    c.strokeStyle = `rgba(${LICHEN}, .25)`
    c.strokeRect(x + 0.5, y0 + 0.5, pw - 1, ph - 1)
    label(text, x + 16, y0 + ph + 30, 12)
  })
  c.font = 'italic 400 36px "Cormorant Garamond"'
  c.fillStyle = '#f2f1ea'
  c.fillText('The loop closes: the heart of the rings is the next seed.', 0.075 * W, y0 - 40)
}

const which = Number(new URLSearchParams(location.search).get('c') ?? 1)
Promise.all([document.fonts.load('400 34px "Cormorant Garamond"'), document.fonts.load('italic 400 34px "Cormorant Garamond"'), document.fonts.load('500 13px Manrope')]).then(() => document.fonts.ready).then(() => {
  if (which === 1) {
    opening(1.25, 0, '…it lands, and the soil answers.')
    tag('1A + 1B · close-up, soil layer')
  } else if (which === 2) {
    opening(3.3, 4, 'Roots first. Then everything else.', 2)
    tag('1A + 1B · roots spread before the crown')
  } else if (which === 3) {
    lushTree()
    tag('2A low limbs · 2B back canopy · 2C falling leaves · 2D undergrowth')
  } else if (which === 4) {
    ringLabels()
    tag('3A service labels · 3B light pulse')
  } else {
    loopStrip()
    tag('3C · seamless loop')
  }
  document.title = 'ready'
})
