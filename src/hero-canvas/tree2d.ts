import { TAU, clamp, mulberry32 } from './math'

// The tree, its roots and the grass at its foot, in height units
// (1 = canvas height), base at (0, 0), y up negative. Every element carries
// the growth time (g, story seconds after sowing) at which it starts and ends.
//
// Shape after the reference illustration: a short flared trunk that forks
// early into four limbs, two low limbs reaching sideways, and a full rounded
// crown built from sprays of compound leaves in three depths of tone.

export interface Branch {
  x0: number
  y0: number
  cx: number
  cy: number
  x1: number
  y1: number
  /** width at the base and tip, in height units */
  w0: number
  w1: number
  depth: number
  t0: number
  t1: number
}

/** a spray of compound leaves; tone 0 = back (dark), 1 = mid, 2 = front (lit) */
export interface Spray {
  x: number
  y: number
  angle: number
  tone: number
  variant: number
  size: number
  t: number
}

export interface Tuft {
  x: number
  h: number
  lean: number
  t: number
}

/** the crown's rounded envelope, for tone and filler placement */
export const CROWN = { cx: 0, cy: -0.45, rx: 0.36, ry: 0.24 }
/** light comes from the upper right */
const LIGHT = { x: 0.55, y: -0.83 }

export const SPRAY_VARIANTS = 6
/** the grown tree is about 0.62 of the frame height */
export const TREE_SCALE = 0.65

export function buildTree(seed = 4) {
  const rnd = mulberry32(seed)
  const branches: Branch[] = []
  const roots: Branch[] = []
  const sprays: Spray[] = []
  const tufts: Tuft[] = []

  const tone = (x: number, y: number, filler: boolean) => {
    const vx = (x - CROWN.cx) / CROWN.rx
    const vy = (y - CROWN.cy) / CROWN.ry
    const lit = vx * LIGHT.x + vy * LIGHT.y + (rnd() - 0.5) * 0.9
    if (filler) return rnd() < 0.75 ? 0 : 1
    if (rnd() < 0.18) return 0
    return lit > 0.3 ? 2 : lit < -0.45 ? 0 : 1
  }

  const spray = (x: number, y: number, angle: number, t: number, filler = false) => {
    sprays.push({
      x,
      y,
      angle,
      tone: tone(x, y, filler),
      variant: Math.floor(rnd() * SPRAY_VARIANTS),
      size: (filler ? 1.15 : 1) * (0.8 + rnd() * 0.45),
      t,
    })
  }

  const MAX_DEPTH = 6

  const grow = (x: number, y: number, angle: number, len: number, w0: number, depth: number, t0: number) => {
    const dx = Math.sin(angle)
    const dy = -Math.cos(angle)
    const x1 = x + dx * len
    const y1 = y + dy * len
    const bend = (rnd() - 0.5) * len * 0.3
    // outer limbs sag a little under their own weight
    const sag = depth >= 2 ? Math.abs(dx) * len * 0.12 : 0
    const dur = 0.3
    const t1 = t0 + dur
    const w1 = w0 * 0.7
    branches.push({ x0: x, y0: y, cx: (x + x1) / 2 - dy * bend, cy: (y + y1) / 2 + dx * bend + sag, x1, y1, w0, w1, depth, t0, t1 })

    if (depth >= MAX_DEPTH) {
      for (let k = 0; k < 3; k++) spray(x1 + (rnd() - 0.5) * 0.03, y1 + (rnd() - 0.5) * 0.025, angle + (rnd() - 0.5) * 1.6, t1 + 0.1 + rnd() * 0.5)
      return
    }
    if (depth >= MAX_DEPTH - 2) spray((x + x1) / 2, (y + y1) / 2, angle + (rnd() < 0.5 ? -1 : 1) * (0.6 + rnd() * 0.6), t1 + 0.2 + rnd() * 0.5)

    const n = depth <= 1 ? 3 : rnd() < 0.3 ? 3 : 2
    const spread = 0.42 + rnd() * 0.18
    for (let i = 0; i < n; i++) {
      let a = angle + (i - (n - 1) / 2) * spread + (rnd() - 0.5) * 0.16
      // deeper branches lean toward the horizontal: a rounded, spreading crown
      a += Math.sign(a || 1) * 0.05 * depth
      a = clamp(a, -1.95, 1.95)
      grow(x1, y1, a, len * (0.68 + rnd() * 0.1), w1 * 0.8, depth + 1, t1 - 0.12)
    }
  }

  // trunk, with a flared foot
  const TRUNK = 0.2
  const trunkT0 = 0.25
  const trunkT1 = 0.85
  branches.push({ x0: 0, y0: 0, cx: 0.004, cy: -TRUNK / 2, x1: 0, y1: -TRUNK, w0: 0.026, w1: 0.016, depth: 0, t0: trunkT0, t1: trunkT1 })
  for (const side of [-1, 1]) {
    branches.push({ x0: side * 0.016, y0: 0.002, cx: side * 0.004, cy: -0.012, x1: 0, y1: -0.045, w0: 0.012, w1: 0.004, depth: 0, t0: trunkT0 + 0.2, t1: trunkT1 })
  }

  // four limbs from the fork
  for (const a of [-0.95, -0.35, 0.3, 0.92]) {
    grow(0, -TRUNK, a + (rnd() - 0.5) * 0.12, 0.19 + rnd() * 0.03, 0.013, 1, trunkT1 - 0.1)
  }
  // two low limbs reaching sideways from the upper trunk
  for (const side of [-1, 1]) {
    grow(0, -TRUNK * 0.62, side * (1.12 + rnd() * 0.12), 0.15, 0.008, 2, trunkT0 + 0.45)
  }

  // filler sprays fill the crown's envelope from the back
  for (let i = 0; i < 620; i++) {
    const a = rnd() * TAU
    const r = Math.sqrt(rnd())
    const x = CROWN.cx + Math.cos(a) * r * CROWN.rx
    const y = CROWN.cy + Math.sin(a) * r * CROWN.ry * (Math.sin(a) > 0 ? 1.15 : 1)
    if (y > -0.2) continue
    spray(x, y, rnd() * TAU, 1.9 + rnd() * 1.2, true)
  }

  // roots: a network spreading under the soil before the crown
  const root = (x: number, y: number, angle: number, len: number, w: number, depth: number, t0: number) => {
    const x1 = x + Math.sin(angle) * len
    const y1 = y + Math.cos(angle) * len
    const bend = (rnd() - 0.5) * len * 0.5
    const t1 = t0 + 0.3
    roots.push({ x0: x, y0: y, cx: (x + x1) / 2 + bend, cy: (y + y1) / 2, x1, y1, w0: w, w1: w * 0.6, depth, t0, t1 })
    if (depth >= 4) return
    const n = rnd() < 0.4 ? 3 : 2
    for (let i = 0; i < n; i++) {
      root(x1, y1, angle + (i - (n - 1) / 2) * 0.7 + (rnd() - 0.5) * 0.4, len * (0.62 + rnd() * 0.2), w * 0.65, depth + 1, t1 - 0.08)
    }
  }
  for (let i = 0; i < 6; i++) root(0, 0.002, (i / 5 - 0.5) * 2.3, 0.04 + rnd() * 0.015, 0.0032, 0, 0.05 + i * 0.03)

  // grass and a few seedlings at the foot
  for (let i = 0; i < 46; i++) {
    let x = (rnd() - 0.5) * 0.76
    if (Math.abs(x) < 0.018) x += Math.sign(x || 1) * 0.02
    tufts.push({ x, h: (0.012 + rnd() * 0.022) * (1 - Math.abs(x) * 1.6), lean: (rnd() - 0.5) * 0.6, t: 1.6 + rnd() * 1.4 })
  }

  // the shapes above are drawn at a comfortable working size; fit the whole
  // tree to the frame here
  const k = TREE_SCALE
  for (const b of [...branches, ...roots]) {
    b.x0 *= k
    b.y0 *= k
    b.cx *= k
    b.cy *= k
    b.x1 *= k
    b.y1 *= k
    b.w0 *= k
    b.w1 *= k
  }
  for (const s of sprays) {
    s.x *= k
    s.y *= k
    s.size *= k
  }
  for (const tf of tufts) {
    tf.x *= k
    tf.h *= k
  }

  sprays.sort((a, b) => a.t - b.t)
  return { branches, roots, sprays, tufts }
}
