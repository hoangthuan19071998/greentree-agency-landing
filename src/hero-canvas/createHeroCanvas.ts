import { TAU, clamp, easeInOut, lerp, mulberry32, smoothstep } from '../hero-engine/math'
import { DURATION, FADE_OUT, SOW, fade, storyAt } from './timeline'
import { buildTree } from './tree2d'
import { BASE, BRANCHES, LEAF_PALETTE, LEAVES_B64, TREE_H } from './treeData'

// Canvas 2D renderer for the living-brand hero: the sowing of the seed close
// up, roots in the soil, the tree after the reference illustration, the dive
// into the trunk and the growth rings with their service labels.
// No images, no video.
//
// The tree itself is drawn from traced vector data (treeData.ts): branch
// polylines with radii and a mosaic of ~9,000 leaves with their colours.
//
// Performance: leaves are stamped from a pre-rendered ImageBitmap atlas;
// leaves that have opened are stamped once into one of three persistent
// layers (dark, mid, light); branches, roots and grass are baked once grown;
// the background glow is painted once per resize; film grain lives in CSS.

const LICHEN = '201, 216, 176'
const GROUND = '#10221a'
const BARK = '#c3d6aa'
const BARK_SHADE = 'rgba(96, 128, 92, 0.38)'
/** the colour inside the trunk, the moment the camera passes into it */
const CORE = '#6f9470'
/** the grown tree's height, in frame heights */
const TREE_UNITS = 0.62
/** reference pixels → tree units */
const REF = TREE_UNITS / TREE_H
/** leaf length in reference pixels */
const LEAF_REF = 20
/** branch growth: the skeleton grows outward over these growth seconds */
const BRANCH_T0 = 0.25
const BRANCH_SPAN = 2.6

// story clock (growth seconds after sowing)
const PULLBACK_END = 4.6
const DIVE_START = 6.9
const DIVE_END = 8.5
/** enough that the trunk's core band is wider than the frame */
const ZOOM_MAX = 260
/** where the camera aims: this far up the trunk, in reference pixels */
const TRUNK_AIM_REF = 190
/** how close the opening shot starts */
const CLOSE_UP = 2.4

const LABELS: [string, number, number][] = [
  ['Strategy', 1, -1.75],
  ['Brand', 3, -1.15],
  ['Engagement', 5, -0.6],
  ['Performance', 8, -2.45],
  ['A brighter tomorrow', 11, -2.85],
]

export interface HeroCanvasOptions {
  onFrame?: (t: number) => void
}

/** A tileable noise texture for a CSS grain overlay. */
export function grainDataURL(size = 160) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  const img = g.createImageData(size, size)
  const rnd = mulberry32(9)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = rnd() * 255
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v
    img.data[i + 3] = 255
  }
  g.putImageData(img, 0, 0)
  return c.toDataURL('image/png')
}

type Layer = OffscreenCanvas | HTMLCanvasElement
const layerCanvas = (w: number, h: number): Layer =>
  typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(w, h) : Object.assign(document.createElement('canvas'), { width: w, height: h })
const toBitmap = (c: Layer) => (c instanceof HTMLCanvasElement ? c : c.transferToImageBitmap())

export function createHeroCanvas(canvas: HTMLCanvasElement, opts: HeroCanvasOptions = {}) {
  const ctx = canvas.getContext('2d', { alpha: false })!
  const tree = buildTree()
  let W = 1
  let H = 1
  let dpr = 1

  // ---- painted once ------------------------------------------------------

  const plate = (cx: number, cy: number) => {
    const c = layerCanvas(Math.max(1, Math.round(W / 4)), Math.max(1, Math.round(H / 4)))
    const g = c.getContext('2d') as CanvasRenderingContext2D
    const r = Math.max(c.width, c.height) * 0.62
    const grad = g.createRadialGradient(cx * c.width, cy * c.height, 0, cx * c.width, cy * c.height, r)
    grad.addColorStop(0, 'rgba(52, 104, 74, 1)')
    grad.addColorStop(0.55, 'rgba(31, 66, 46, 0.45)')
    grad.addColorStop(1, 'rgba(16, 34, 26, 0)')
    g.fillStyle = grad
    g.fillRect(0, 0, c.width, c.height)
    return toBitmap(c)
  }
  let glowTree = plate(0.66, 0.32)
  let glowRings = plate(0.74, 0.5)
  let ringMask: CanvasGradient = ctx.createLinearGradient(0, 0, 1, 0)

  // leaf atlas: one row per palette colour, 12 angles + a dot column. A leaf
  // is a pointed oval with a faint midrib, like the reference's.
  const ANGLES = 12
  const CELL = 32
  const LEAF_PX = 26
  const atlas = (() => {
    const c = layerCanvas(CELL * (ANGLES + 1), CELL * LEAF_PALETTE.length)
    const g = c.getContext('2d') as CanvasRenderingContext2D
    LEAF_PALETTE.forEach((colour, row) => {
      for (let k = 0; k < ANGLES; k++) {
        g.save()
        g.translate(k * CELL + CELL / 2, row * CELL + CELL / 2)
        g.rotate((k / ANGLES) * Math.PI)
        const L = LEAF_PX / 2
        const w = LEAF_PX * 0.34
        g.fillStyle = colour
        g.beginPath()
        g.moveTo(0, -L)
        g.quadraticCurveTo(w * 1.6, -L * 0.1, 0, L)
        g.quadraticCurveTo(-w * 1.6, -L * 0.1, 0, -L)
        g.fill()
        g.strokeStyle = 'rgba(255, 255, 255, 0.12)'
        g.lineWidth = 0.8
        g.beginPath()
        g.moveTo(0, -L * 0.8)
        g.lineTo(0, L * 0.85)
        g.stroke()
        g.restore()
      }
      g.fillStyle = colour
      g.beginPath()
      g.arc(ANGLES * CELL + CELL / 2, row * CELL + CELL / 2, CELL * 0.3, 0, TAU)
      g.fill()
    })
    return toBitmap(c)
  })()

  // traced leaves, decoded once: position in tree units, colour, angle, and
  // the growth second at which each opens (after the branch beneath it)
  const leaves = (() => {
    const bin = atob(LEAVES_B64)
    const out: { x: number; y: number; colour: number; angle: number; t: number; band: number }[] = []
    for (let n = 0; n + 6 < bin.length; n += 7) {
      const b = (k: number) => bin.charCodeAt(n + k)
      const x = b(0) | (b(1) << 8)
      const y = b(2) | (b(3) << 8)
      const colour = b(4)
      const r = b(6) / 255
      const geo = clamp((r - 0.11) / 0.8)
      out.push({
        x: (x - BASE[0]) * REF,
        y: (y - BASE[1]) * REF,
        colour,
        angle: (b(5) / 256) * ANGLES,
        t: BRANCH_T0 + BRANCH_SPAN * geo + 0.35,
        band: colour < 5 ? 0 : colour < 10 ? 1 : 2,
      })
    }
    return out.sort((p, q) => p.t - q.t)
  })()

  // traced branches in tree units: [x, y, half-width, growth 0..1]
  const branches = BRANCHES.map((line) => line.map(([x, y, r, d]) => [(x - BASE[0]) * REF, (y - BASE[1]) * REF, r * REF, d]))
  // the trunk point the dive aims at: the thickest skeleton point at that height
  const aim = (() => {
    let best = [0, -TRUNK_AIM_REF * REF, 0]
    for (const line of branches) for (const p of line) {
      if (Math.abs(p[1] + TRUNK_AIM_REF * REF) < 8 * REF && p[2] > best[2]) best = p
    }
    return { x: best[0], y: best[1] }
  })()

  const motes = (() => {
    const rnd = mulberry32(21)
    return Array.from({ length: 46 }, () => ({ x: rnd(), y: rnd(), r: 0.6 + rnd() * 1.4, p: rnd() * TAU, s: 0.2 + rnd() * 0.5 }))
  })()

  const specks = (() => {
    const rnd = mulberry32(33)
    return Array.from({ length: 14 }, () => ({ vx: (rnd() - 0.5) * 0.11, vy: -(0.05 + rnd() * 0.09), r: 1.2 + rnd() * 1.8, rest: (rnd() - 0.5) * 0.03 }))
  })()

  const grains = (() => {
    const rnd = mulberry32(5)
    return Array.from({ length: 420 }, () => ({ x: (rnd() - 0.5) * 2.6, y: 0.006 + Math.pow(rnd(), 0.8) * 0.4, r: 0.0008 + rnd() * 0.0016 }))
  })()

  const falling = (() => {
    const rnd = mulberry32(44)
    return Array.from({ length: 9 }, (_, k) => ({ x: (rnd() - 0.5) * 0.6, y: -0.24 - rnd() * 0.12, k, colour: LEAF_PALETTE[8 + (k % 5)] }))
  })()

  // ring shapes: shared low-frequency wobble so rings nest without crossing
  const ringRnd = mulberry32(13)
  const harmonics = [3, 4, 5, 7, 9, 12, 16].map((k) => ({ k, phase: ringRnd() * TAU, amp: 0.55 / k ** 0.65 }))
  const RINGS = 22
  const STEPS = 120
  const cosT = Float32Array.from({ length: STEPS }, (_, s) => Math.cos((s / STEPS) * TAU))
  const sinT = Float32Array.from({ length: STEPS }, (_, s) => Math.sin((s / STEPS) * TAU))
  const ringNoise = Array.from({ length: RINGS }, (_, i) =>
    Float32Array.from({ length: STEPS }, (_, s) => {
      const th = (s / STEPS) * TAU
      return 0.12 * Math.sin(11 * th + i * 2.3) + 0.08 * Math.sin(19 * th + i * 4.1)
    }),
  )
  const wobble = new Float32Array(STEPS)

  const layout = () => ({ bx: W * 0.705, by: H * 0.84, u: H })

  // ---- background --------------------------------------------------------

  function background(g: number) {
    ctx.fillStyle = GROUND
    ctx.fillRect(0, 0, W, H)
    const rings = smoothstep(DIVE_END, DIVE_END + 1, g)
    const amt = 0.35 + 0.25 * smoothstep(-1, 3, g)
    if (rings < 1) {
      ctx.globalAlpha = amt * (1 - rings)
      ctx.drawImage(glowTree, 0, 0, W, H)
    }
    if (rings > 0) {
      ctx.globalAlpha = amt * rings
      ctx.drawImage(glowRings, 0, 0, W, H)
    }
    ctx.globalAlpha = 1
  }

  // ---- the ground: soil, ground line, the sowing -------------------------

  function drawSoil(S: number, bx: number, by: number, u: number) {
    const a = smoothstep(0.1, 0.6, S)
    if (a <= 0) return
    const soil = ctx.createLinearGradient(0, by, 0, by + 0.35 * u)
    soil.addColorStop(0, `rgba(8, 18, 13, ${0.6 * a})`)
    soil.addColorStop(1, `rgba(6, 14, 10, ${0.92 * a})`)
    ctx.fillStyle = soil
    ctx.fillRect(bx - 3 * u, by, 6 * u, 0.6 * u)
    ctx.strokeStyle = `rgba(${LICHEN}, ${0.06 * a})`
    ctx.lineWidth = 0.0012 * u
    for (let k = 0; k < 3; k++) {
      const y = by + (0.05 + k * 0.07) * u
      ctx.beginPath()
      for (let x = -2.6; x <= 2.6; x += 0.05) {
        const px = bx + x * u
        const py = y + Math.sin(x * 6 + k * 2) * 0.008 * u
        if (x === -2.6) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.stroke()
    }
    ctx.fillStyle = `rgba(${LICHEN}, ${0.16 * a})`
    ctx.beginPath()
    for (const gr of grains) {
      const x = bx + gr.x * u
      const y = by + gr.y * u
      ctx.moveTo(x + gr.r * u, y)
      ctx.arc(x, y, gr.r * u, 0, TAU)
    }
    ctx.fill()
    ctx.strokeStyle = `rgba(${LICHEN}, ${0.38 * a})`
    ctx.lineWidth = 0.0013 * u
    ctx.beginPath()
    ctx.moveTo(bx - 3 * u, by)
    ctx.lineTo(bx + 3 * u, by)
    ctx.stroke()
  }

  /** The opening: a seed falls, lands, throws up soil, settles and wakes. */
  function drawSowing(S: number, g: number, bx: number, by: number, u: number) {
    const seedA = smoothstep(0.3, 0.55, S) * (1 - smoothstep(0.6, 1.4, g))
    if (seedA > 0.01) {
      const fall = clamp((S - 0.35) / 0.65)
      const sink = smoothstep(1.0, 1.45, S)
      const y = lerp(by - 0.32 * u, by - 0.003 * u, fall * fall) + sink * 0.006 * u
      const spin = (1 - fall) * 2.4 - 0.4
      if (fall > 0 && fall < 1) {
        const trail = ctx.createLinearGradient(bx, y - 0.08 * u, bx, y)
        trail.addColorStop(0, `rgba(${LICHEN}, 0)`)
        trail.addColorStop(1, `rgba(${LICHEN}, ${0.35 * seedA})`)
        ctx.strokeStyle = trail
        ctx.lineWidth = 0.002 * u
        ctx.beginPath()
        ctx.moveTo(bx, y - 0.08 * u * fall)
        ctx.lineTo(bx, y)
        ctx.stroke()
      }
      ctx.fillStyle = `rgba(${LICHEN}, ${seedA * (1 - 0.45 * sink)})`
      ctx.beginPath()
      ctx.ellipse(bx, y, 0.0075 * u, 0.005 * u, spin, 0, TAU)
      ctx.fill()
    }

    const k = S - 1.0
    if (k > 0 && g < 3.4) {
      const a = (1 - smoothstep(2.6, 3.4, g)) * 0.75
      ctx.fillStyle = `rgba(${LICHEN}, ${a})`
      ctx.beginPath()
      for (const s of specks) {
        const air = Math.min(k, 0.55)
        let x = bx + s.vx * u * air * 1.8
        let y = by + (s.vy * air + 0.45 * air * air) * u * 1.8
        const r = s.r * 0.0011 * u
        if (k >= 0.55 || y > by) {
          x = bx + s.rest * u
          y = by - r * 0.5
        }
        ctx.moveTo(x + r, y)
        ctx.arc(x, y, r, 0, TAU)
      }
      ctx.fill()
    }

    const rip = clamp((S - 1.0) / 0.9)
    if (rip > 0 && rip < 1) {
      ctx.strokeStyle = `rgba(${LICHEN}, ${0.5 * (1 - rip)})`
      ctx.lineWidth = 0.0013 * u
      ctx.beginPath()
      ctx.ellipse(bx, by, 0.15 * u * easeInOut(rip), 0.018 * u * easeInOut(rip), 0, 0, TAU)
      ctx.stroke()
    }

    const wake = fade(S, 1.25, 1.6, 1.8, 2.6)
    if (wake > 0.01) {
      const r = 0.09 * u
      const glow = ctx.createRadialGradient(bx, by, 0, bx, by, r)
      glow.addColorStop(0, `rgba(${LICHEN}, ${0.35 * wake})`)
      glow.addColorStop(1, `rgba(${LICHEN}, 0)`)
      ctx.fillStyle = glow
      ctx.fillRect(bx - r, by - r, r * 2, r * 2)
    }
  }

  // ---- branches, roots, grass --------------------------------------------

  // Roots in the tree's own idiom: bark-coloured, tapering, continuing the
  // trunk's flared foot into a few thick roots that fork and thin out. Built in
  // reference pixels like the traced branches: [x, y, radius, growth 0..1].
  const roots = (() => {
    const rnd = mulberry32(61)
    const lines: number[][][] = []
    const grow = (x: number, y: number, angle: number, len: number, r0: number, d0: number, depth: number) => {
      const pts: number[][] = []
      const steps = 9
      let a = angle
      let px = x
      let py = y
      let d = d0
      for (let i = 0; i <= steps; i++) {
        const f = i / steps
        pts.push([px, py, Math.max(0.7, r0 * (1 - 0.85 * f)), d])
        // outer roots turn toward the horizontal; all of them wander a little
        a += Math.sign(angle || 1) * 0.05 * Math.abs(Math.sin(angle)) + (rnd() - 0.5) * 0.22
        // never past the horizontal, never back above the soil
        a = clamp(a, -1.42, 1.42)
        const step = len / steps
        px += Math.sin(a) * step
        py = Math.max(BASE[1] - 4, py + Math.cos(a) * step)
        d += step
      }
      lines.push(pts)
      if (depth >= 2) return
      const forks = depth === 0 ? 2 + Math.floor(rnd() * 2) : 1 + Math.floor(rnd() * 2)
      for (let k = 0; k < forks; k++) {
        const at = Math.floor(steps * (0.3 + rnd() * 0.45))
        const p = pts[at]
        const side = rnd() < 0.5 ? -1 : 1
        grow(p[0], p[1], angle + side * (0.55 + rnd() * 0.5), len * (0.45 + rnd() * 0.2), p[2] * 0.6, p[3], depth + 1)
      }
    }
    for (const angle of [-1.2, -0.68, -0.2, 0.25, 0.72, 1.18]) {
      const a = angle + (rnd() - 0.5) * 0.15
      const len = 85 + rnd() * 55 - Math.abs(angle) * 10
      // start on the flared foot, a little above the ground line
      grow(BASE[0] + Math.sin(a) * 15, BASE[1] - 6, a, len, 10.5 - Math.abs(angle) * 3, 0, 0)
    }
    let dmax = 0
    for (const l of lines) for (const p of l) dmax = Math.max(dmax, p[3])
    return lines.map((l) => l.map(([x, y, r, d]) => [(x - BASE[0]) * REF, (y - BASE[1]) * REF, r * REF, d / dmax]))
  })()
  const ROOT_T0 = 0.05
  const ROOT_SPAN = 1.5

  const STATIC_DONE = Math.max(BRANCH_T0 + BRANCH_SPAN, ROOT_T0 + ROOT_SPAN, ...tree.tufts.map((t) => t.t + 0.5))
  const thickAt = (g: number) => lerp(0.5, 1, smoothstep(BRANCH_T0, STATIC_DONE, g))

  /** a traced polyline as a filled, tapering outline, grown up to G */
  function polyline(path: Path2D, line: number[][], G: number, k: number, bx: number, by: number, u: number) {
    if (line[0][3] > G) return
    const pts: number[][] = [line[0]]
    for (let i = 1; i < line.length; i++) {
      const p = line[i]
      if (p[3] <= G) {
        pts.push(p)
        continue
      }
      const q = line[i - 1]
      const f = (G - q[3]) / (p[3] - q[3] || 1)
      pts.push([lerp(q[0], p[0], f), lerp(q[1], p[1], f), lerp(q[2], p[2], f), G])
      break
    }
    if (pts.length < 2) return
    const left: number[] = []
    const right: number[] = []
    for (let i = 0; i < pts.length; i++) {
      const a = pts[Math.max(0, i - 1)]
      const b = pts[Math.min(pts.length - 1, i + 1)]
      let tx = b[0] - a[0]
      let ty = b[1] - a[1]
      const len = Math.hypot(tx, ty) || 1
      tx /= len
      ty /= len
      const w = Math.max(0.35, pts[i][2] * u * k)
      const x = bx + pts[i][0] * u
      const y = by + pts[i][1] * u
      left.push(x - ty * w, y + tx * w)
      right.push(x + ty * w, y - tx * w)
    }
    path.moveTo(left[0], left[1])
    for (let i = 2; i < left.length; i += 2) path.lineTo(left[i], left[i + 1])
    for (let i = right.length - 2; i >= 0; i -= 2) path.lineTo(right[i], right[i + 1])
    path.closePath()
  }

  function paintRoots(c: CanvasRenderingContext2D, g: number, bx: number, by: number, u: number) {
    const G = easeInOut(clamp((g - ROOT_T0) / ROOT_SPAN))
    const k = lerp(0.55, 1, smoothstep(ROOT_T0, STATIC_DONE, g))
    const body = new Path2D()
    const shade = new Path2D()
    for (const line of roots) {
      polyline(body, line, G, k, bx, by, u)
      if (line[0][2] > 5 * REF) polyline(shade, line, G, k * 0.4, bx, by, u)
    }
    // the same bark as the trunk, sinking into the soil with depth
    const depth = c.createLinearGradient(0, by - 0.01 * u, 0, by + 0.13 * u)
    depth.addColorStop(0, BARK)
    depth.addColorStop(0.45, 'rgba(195, 214, 170, 0.55)')
    depth.addColorStop(1, 'rgba(195, 214, 170, 0)')
    c.fillStyle = depth
    c.fill(body)
    c.fillStyle = BARK_SHADE
    c.fill(shade)
  }

  function paintBranches(c: CanvasRenderingContext2D, g: number, bx: number, by: number, u: number, only?: (line: number[][]) => boolean) {
    const G = easeInOut(clamp((g - BRANCH_T0) / BRANCH_SPAN))
    const k = thickAt(g)
    const body = new Path2D()
    const shade = new Path2D()
    for (const line of branches) {
      if (only && !only(line)) continue
      polyline(body, line, G, k, bx, by, u)
      // a soft shaded core on the thicker limbs gives them roundness
      if (line[0][2] > 3.2 * REF) polyline(shade, line, G, k * 0.4, bx, by, u)
    }
    c.fillStyle = BARK
    c.fill(body)
    c.fillStyle = BARK_SHADE
    c.fill(shade)
  }

  function paintTufts(c: CanvasRenderingContext2D, g: number, bx: number, by: number, u: number) {
    c.strokeStyle = `rgba(${LICHEN}, 0.55)`
    c.lineWidth = 0.0013 * u
    c.lineCap = 'round'
    c.beginPath()
    for (const tf of tree.tufts) {
      const p = smoothstep(tf.t, tf.t + 0.5, g)
      if (p <= 0) continue
      for (let b = -1; b <= 1; b++) {
        const x = bx + (tf.x + b * 0.003) * u
        const h = tf.h * u * p * (b === 0 ? 1 : 0.7)
        c.moveTo(x, by)
        c.quadraticCurveTo(x + (tf.lean + b * 0.4) * h * 0.3, by - h * 0.6, x + (tf.lean + b * 0.5) * h * 0.6, by - h)
      }
    }
    c.stroke()
  }

  let staticLayer: Layer | null = null
  function bakeStatic() {
    const { bx, by, u } = layout()
    const layer = layerCanvas(canvas.width, canvas.height)
    const c = layer.getContext('2d') as CanvasRenderingContext2D
    c.setTransform(dpr, 0, 0, dpr, 0, 0)
    paintRoots(c, STATIC_DONE, bx, by, u)
    paintBranches(c, STATIC_DONE, bx, by, u)
    staticLayer = layer
  }
  let tuftLayer: Layer | null = null
  function bakeTufts() {
    const { bx, by, u } = layout()
    const layer = layerCanvas(canvas.width, canvas.height)
    const c = layer.getContext('2d') as CanvasRenderingContext2D
    c.setTransform(dpr, 0, 0, dpr, 0, 0)
    paintTufts(c, STATIC_DONE, bx, by, u)
    tuftLayer = layer
  }

  // ---- leaves: stamped from the atlas, settled into dark/mid/light layers ----

  const settled: { layer: Layer; ctx: CanvasRenderingContext2D }[] = []
  let settledCount = 0
  let lastG = -Infinity
  let treeLayer: Layer | null = null
  const resetSettled = () => {
    treeLayer = null
    settled.length = 0
    for (let tone = 0; tone < 3; tone++) {
      const layer = layerCanvas(canvas.width, canvas.height)
      const c = layer.getContext('2d') as CanvasRenderingContext2D
      c.setTransform(dpr, 0, 0, dpr, 0, 0)
      settled.push({ layer, ctx: c })
    }
    settledCount = 0
  }
  resetSettled()

  function stampLeaf(c: CanvasRenderingContext2D, l: (typeof leaves)[number], p: number, bx: number, by: number, u: number) {
    const x = bx + l.x * u
    const y = by + l.y * u
    const row = l.colour * CELL
    if (p < 0.4) {
      const r = Math.max(0.5, 0.0022 * u * (p / 0.4))
      c.drawImage(atlas, ANGLES * CELL, row, CELL, CELL, x - r * 1.7, y - r * 1.7, r * 3.4, r * 3.4)
    } else {
      const size = LEAF_REF * REF * u * smoothstep(0.4, 1, p) * (CELL / LEAF_PX)
      c.drawImage(atlas, Math.floor(l.angle) * CELL, row, CELL, CELL, x - size / 2, y - size / 2, size, size)
    }
  }

  function drawFalling(g: number, bx: number, by: number, u: number) {
    for (const f of falling) {
      const since = g - 4.4 - f.k * 0.31
      if (since < 0) continue
      const local = since % 2.8
      const a = smoothstep(0, 0.3, local) * (1 - smoothstep(2.4, 2.8, local))
      if (a <= 0) continue
      const x = bx + (f.x + Math.sin(local * 1.9 + f.k) * 0.025 + local * 0.012) * u
      const y = by + (f.y + local * 0.09) * u
      if (y > by) continue
      ctx.globalAlpha = a * 0.85
      ctx.fillStyle = f.colour
      ctx.beginPath()
      ctx.ellipse(x, y, 0.0035 * u, 0.008 * u, local * 2.2 + f.k, 0, TAU)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  function drawTree(g: number, alpha: number, bx: number, by: number, u: number) {
    // stamp every leaf that has finished opening into its band's layer
    if (g < lastG) resetSettled()
    lastG = g
    while (settledCount < leaves.length && leaves[settledCount].t + 0.5 <= g) {
      const l = leaves[settledCount]
      stampLeaf(settled[l.band].ctx, l, 1, bx, by, u)
      settledCount++
    }
    const opening = (band: number) => {
      for (let i = settledCount; i < leaves.length; i++) {
        const l = leaves[i]
        const p = smoothstep(l.t, l.t + 0.5, g)
        if (p <= 0) break
        if (l.band === band) stampLeaf(ctx, l, p, bx, by, u)
      }
    }
    const blit = (layer: Layer) => ctx.drawImage(layer, 0, 0, W, H)

    ctx.globalAlpha = alpha
    const grown = g >= STATIC_DONE
    if (grown) {
      if (!staticLayer) bakeStatic()
      if (!tuftLayer) bakeTufts()
    }
    // fully grown: every layer flattened into one, a single blit per frame
    if (grown && settledCount === leaves.length) {
      if (!treeLayer) {
        treeLayer = layerCanvas(canvas.width, canvas.height)
        const c = treeLayer.getContext('2d') as CanvasRenderingContext2D
        for (const layer of [settled[0].layer, staticLayer!, settled[1].layer, settled[2].layer, tuftLayer!]) c.drawImage(layer, 0, 0)
      }
      blit(treeLayer)
      ctx.globalAlpha = 1
      if (alpha > 0.5) drawFalling(g, bx, by, u)
      return
    }
    // roots (under the soil), then back leaves, branches, mid and front leaves
    if (grown && staticLayer) {
      blit(settled[0].layer)
      opening(0)
      blit(staticLayer)
    } else {
      paintRoots(ctx, g, bx, by, u)
      blit(settled[0].layer)
      opening(0)
      paintBranches(ctx, g, bx, by, u)
    }
    blit(settled[1].layer)
    opening(1)
    blit(settled[2].layer)
    opening(2)
    if (grown && tuftLayer) blit(tuftLayer)
    else paintTufts(ctx, g, bx, by, u)
    ctx.globalAlpha = 1
    if (alpha > 0.5) drawFalling(g, bx, by, u)
  }

  /** The trunk alone, live, so it stays crisp at any zoom during the dive. */
  function drawTrunk(bx: number, by: number, u: number) {
    // the thick limbs only: the trunk and the first forks
    paintBranches(ctx, STATIC_DONE, bx, by, u, (line) => line[0][2] > 4 * REF)
  }

  // ---- rings ---------------------------------------------------------------

  const ringRadius = (i: number, push: number) => H * (0.045 + i * 0.043 * (1 + i * 0.014)) * push
  /** radius of ring i at angle th, following its wobble */
  const ringAt = (i: number, th: number, R: number) => {
    const f = ((((th % TAU) + TAU) % TAU) / TAU) * STEPS
    const s0 = Math.floor(f) % STEPS
    const s1 = (s0 + 1) % STEPS
    const k = f - Math.floor(f)
    const n = lerp(wobble[s0] + ringNoise[i][s0], wobble[s1] + ringNoise[i][s1], k)
    return R * (1 + (0.05 + i * 0.006) * n)
  }

  // The ring lines are the most expensive thing on screen: ~22 long polylines
  // stroked every frame. Stroke cost grows with device pixels, so they are
  // drawn into their own layer at 1x and scaled up; soft lines lose nothing.
  let ringLayer: Layer | null = null
  let ringCtx: CanvasRenderingContext2D | null = null

  function drawRings(g: number) {
    const grow = smoothstep(DIVE_END - 0.05, DIVE_END + 1.5, g)
    if (grow <= 0) return
    const push = lerp(0.5, 1, easeInOut(smoothstep(DIVE_END - 0.05, DIVE_END + 1.9, g)))
    const cx = W * 0.75
    const cy = H * 0.52
    const spin = g * 0.02
    const drift = g * 0.06
    for (let s = 0; s < STEPS; s++) {
      const th = (s / STEPS) * TAU
      let n = 0
      for (const h of harmonics) n += h.amp * Math.sin(h.k * (th + spin) + h.phase + drift * (h.k % 2 ? 1 : -1))
      wobble[s] = n
    }
    const scale = Math.min(dpr, 1)
    if (!ringLayer) {
      ringLayer = layerCanvas(Math.round(W * scale), Math.round(H * scale))
      ringCtx = ringLayer.getContext('2d') as CanvasRenderingContext2D
    }
    const rc = ringCtx!
    rc.setTransform(1, 0, 0, 1, 0, 0)
    rc.clearRect(0, 0, ringLayer.width, ringLayer.height)
    rc.setTransform(scale, 0, 0, scale, 0, 0)
    rc.strokeStyle = `rgb(${LICHEN})`
    rc.lineJoin = 'miter'
    for (let i = 0; i < RINGS; i++) {
      const show = clamp((grow * (RINGS + 2) - i) * 0.9)
      if (show <= 0) continue
      const R = ringRadius(i, push) * (0.85 + 0.15 * show)
      const amp = 0.05 + i * 0.006
      const a = (i === 0 ? 0.95 : 0.78 - i * 0.026) * show
      const noise = ringNoise[i]
      rc.beginPath()
      for (let s = 0; s < STEPS; s++) {
        const r = R * (1 + amp * (wobble[s] + noise[s]))
        const x = cx + cosT[s] * r
        const y = cy + sinT[s] * r
        if (s === 0) rc.moveTo(x, y)
        else rc.lineTo(x, y)
      }
      rc.closePath()
      if (i < 4) {
        rc.globalAlpha = a * 0.1
        rc.lineWidth = 5
        rc.stroke()
      }
      rc.globalAlpha = a
      rc.lineWidth = i === 0 ? 2.6 : Math.max(1, 1.8 - i * 0.04)
      rc.stroke()
    }
    rc.globalAlpha = 1
    ctx.globalAlpha = 1
    ctx.drawImage(ringLayer, 0, 0, W, H)
    ctx.globalAlpha = grow
    ctx.fillStyle = `rgb(${LICHEN})`
    ctx.beginPath()
    ctx.arc(cx, cy, 2.2, 0, TAU)
    ctx.fill()

    // a soft wave of light travelling outward, ring by ring
    if (g > DIVE_END + 1.5) {
      const phase = ((g - DIVE_END - 1.5) % 2.4) / 1.7
      if (phase < 1) {
        const r = lerp(ringRadius(0, push), ringRadius(15, push), easeInOut(phase))
        const band = H * 0.04
        const a = Math.sin(phase * Math.PI) * 0.24
        const wave = ctx.createRadialGradient(cx, cy, Math.max(0, r - band), cx, cy, r + band)
        wave.addColorStop(0, `rgba(${LICHEN}, 0)`)
        wave.addColorStop(0.5, `rgba(${LICHEN}, ${a})`)
        wave.addColorStop(1, `rgba(${LICHEN}, 0)`)
        ctx.globalAlpha = 1
        ctx.fillStyle = wave
        ctx.beginPath()
        ctx.arc(cx, cy, r + band, 0, TAU)
        ctx.arc(cx, cy, Math.max(0, r - band), 0, TAU, true)
        ctx.fill()
      }
    }

    // rings recede behind the copy on the left
    ctx.globalAlpha = grow
    ctx.fillStyle = ringMask
    ctx.fillRect(0, 0, W * 0.62, H)
    ctx.globalAlpha = 1

    drawLabels(g, cx, cy, push)
  }

  // Rotated text is re-rasterised glyph by glyph every frame, which is slow;
  // instead each letter is rendered once into a bitmap and stamped turned.
  type Glyph = { img: ImageBitmap | HTMLCanvasElement; w: number }
  let glyphs: Glyph[][] = []
  let glyphSize = 0
  const glyphOverhang = 0.35
  function buildGlyphs() {
    glyphSize = H * 0.026
    const font = `italic 400 ${glyphSize}px "Cormorant Garamond", Georgia, serif`
    glyphs = LABELS.map(([text]) =>
      [...text].map((ch) => {
        const probe = layerCanvas(1, 1).getContext('2d') as CanvasRenderingContext2D
        probe.font = font
        const w = probe.measureText(ch).width
        const pad = glyphSize * glyphOverhang
        const c = layerCanvas(Math.max(1, Math.ceil((w + pad * 2) * dpr)), Math.ceil(glyphSize * 1.6 * dpr))
        const g = c.getContext('2d') as CanvasRenderingContext2D
        g.scale(dpr, dpr)
        g.font = font
        g.fillStyle = '#f2f1ea'
        g.textBaseline = 'alphabetic'
        g.fillText(ch, pad, glyphSize * 1.15)
        return { img: toBitmap(c), w }
      }),
    )
  }

  /** the services, each written along its own ring, appearing in turn */
  function drawLabels(g: number, cx: number, cy: number, push: number) {
    if (glyphs.length === 0) buildGlyphs()
    const size = glyphSize
    LABELS.forEach(([text, i, start], k) => {
      const t0 = DIVE_END + 0.6 + k * 0.3
      const a = smoothstep(t0, t0 + 0.4, g)
      if (a <= 0) return
      const typed = Math.ceil(text.length * smoothstep(t0, t0 + 0.6, g))
      const R = ringRadius(i, push)
      const inset = size * 0.45
      const word = glyphs[k]
      // measure the arc the word needs
      let span = 0
      for (const gl of word) span += gl.w
      const rMid = ringAt(i, start, R) - inset
      const sweep = span / rMid
      // dark backing following the ring
      ctx.globalAlpha = 0.85 * a
      ctx.strokeStyle = GROUND
      ctx.lineWidth = size * 1.25
      ctx.lineCap = 'round'
      ctx.beginPath()
      for (let s = 0; s <= 12; s++) {
        const th = start - 0.02 + ((sweep + 0.04) * s) / 12
        const r = ringAt(i, th, R) - inset + size * 0.3
        const x = cx + Math.cos(th) * r
        const y = cy + Math.sin(th) * r
        if (s === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
      // the letters, each turned to the ring
      ctx.globalAlpha = a
      let th = start
      const pad = size * glyphOverhang
      for (let n = 0; n < Math.min(typed, word.length); n++) {
        const { img, w } = word[n]
        const r = ringAt(i, th, R) - inset
        const mid = th + w / r / 2
        const rot = mid + Math.PI / 2
        const cos = Math.cos(rot)
        const sin = Math.sin(rot)
        // place the glyph's baseline centre on the ring, turned to it
        ctx.setTransform(dpr * cos, dpr * sin, -dpr * sin, dpr * cos, dpr * (cx + Math.cos(mid) * r), dpr * (cy + Math.sin(mid) * r))
        ctx.drawImage(img, -w / 2 - pad, -size * 1.15, w + pad * 2, size * 1.6)
        th += w / r
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.fillStyle = '#c9d8b0'
      const r0 = ringAt(i, start - 0.05, R) - inset + size * 0.3
      ctx.beginPath()
      ctx.arc(cx + Math.cos(start - 0.05) * r0, cy + Math.sin(start - 0.05) * r0, size * 0.12, 0, TAU)
      ctx.fill()
    })
    ctx.globalAlpha = 1
  }

  function drawMotes(g: number, zoom: number) {
    const a = smoothstep(2.5, 4.5, g) * (1 - 0.85 * fade(g, DIVE_START + 0.3, DIVE_END - 0.3, DIVE_END + 0.2, DIVE_END + 1.2))
    if (a <= 0) return
    const cx = W * 0.75
    const cy = H * 0.52
    const k = 1 + (zoom - 1) * 0.06
    ctx.fillStyle = `rgba(${LICHEN}, ${0.25 * a})`
    ctx.beginPath()
    for (const m of motes) {
      const x = cx + ((0.5 + m.x * 0.48) * W + Math.sin(g * m.s + m.p) * 12 - cx) * k
      const y = cy + ((0.12 + m.y * 0.7) * H - ((Math.max(g, 0) * m.s * 6) % 40) - cy) * k
      ctx.moveTo(x + m.r, y)
      ctx.arc(x, y, m.r, 0, TAU)
    }
    ctx.fill()
  }

  // ---- the frame -----------------------------------------------------------

  function renderAt(time: number) {
    const t = ((time % DURATION) + DURATION) % DURATION
    const S = storyAt(t)
    const g = S - SOW
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    background(g)

    const { bx, by, u } = layout()

    // the opening close-up pulls back as the tree grows
    const pull = 1 - easeInOut(clamp((S - 1.3) / (SOW + PULLBACK_END - 1.3)))
    const cam = 1 + (CLOSE_UP - 1) * pull
    const ax = lerp(bx, W * 0.6, pull)
    const ay = lerp(by, H * 0.64, pull)

    // the dive: exponential zoom into the trunk, gliding to the rings' centre
    const dive = clamp((g - DIVE_START) / (DIVE_END - DIVE_START))
    const zoom = Math.pow(ZOOM_MAX, Math.pow(dive, 1.7))
    const glide = easeInOut(clamp((g - DIVE_START) / ((DIVE_END - DIVE_START) * 0.75)))
    const inside = g >= DIVE_END + 0.02

    if (!inside) {
      const px = bx + aim.x * u
      const py = by + aim.y * u
      ctx.save()
      ctx.translate(ax, ay)
      ctx.scale(cam, cam)
      ctx.translate(-bx, -by)
      ctx.translate(lerp(px, W * 0.75, glide), lerp(py, H * 0.52, glide))
      ctx.scale(zoom, zoom)
      ctx.translate(-px, -py)
      drawSoil(S, bx, by, u)
      drawSowing(S, g, bx, by, u)
      const crown = 1 - smoothstep(3, 14, zoom)
      if (g > 0 && crown > 0.01) drawTree(g, crown, bx, by, u)
      if (dive > 0) drawTrunk(bx, by, u)
      ctx.restore()
    }

    const core = smoothstep(DIVE_END - 0.3, DIVE_END, g) * (1 - smoothstep(DIVE_END + 0.02, DIVE_END + 0.75, g))
    if (core > 0.001) {
      ctx.globalAlpha = core
      ctx.fillStyle = CORE
      ctx.fillRect(0, 0, W, H)
      ctx.globalAlpha = 1
    }
    drawRings(g)
    drawMotes(g, zoom)

    // dark at the loop seam
    const dark = 1 - smoothstep(0, 0.3, t) + smoothstep(DURATION - FADE_OUT, DURATION, t)
    if (dark > 0.001) {
      ctx.globalAlpha = clamp(dark)
      ctx.fillStyle = GROUND
      ctx.fillRect(0, 0, W, H)
      ctx.globalAlpha = 1
    }
    opts.onFrame?.(t)
  }

  let raf = 0
  let t0 = 0
  let offset = 0
  const loop = (now: number) => {
    renderAt((now - t0) / 1000 + offset)
    raf = requestAnimationFrame(loop)
  }

  return {
    renderAt,
    setSize(w: number, h: number, ratio: number) {
      W = w
      H = h
      dpr = ratio
      canvas.width = Math.round(w * ratio)
      canvas.height = Math.round(h * ratio)
      glowTree = plate(0.66, 0.32)
      glowRings = plate(0.74, 0.5)
      ringMask = ctx.createLinearGradient(W * 0.3, 0, W * 0.62, 0)
      ringMask.addColorStop(0, 'rgba(16, 34, 26, 0.88)')
      ringMask.addColorStop(1, 'rgba(16, 34, 26, 0)')
      resetSettled()
      lastG = -Infinity
      staticLayer = null
      tuftLayer = null
      glyphs = []
      ringLayer = null
      const idle = globalThis.requestIdleCallback ?? ((fn: () => void) => setTimeout(fn, 200))
      idle(() => {
        if (!staticLayer) bakeStatic()
        if (!tuftLayer) bakeTufts()
      })
    },
    start(from = 0) {
      cancelAnimationFrame(raf)
      offset = from
      t0 = performance.now()
      raf = requestAnimationFrame(loop)
    },
    stop() {
      cancelAnimationFrame(raf)
      raf = 0
    },
    get playing() {
      return raf !== 0
    },
  }
}
