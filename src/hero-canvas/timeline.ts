import { clamp, smoothstep } from '../hero-engine/math'

// The living-brand hero. Real time t (0 → DURATION) is mapped onto story time
// S by a smooth monotone curve, so the tempo can change (fast growth, a hold
// on the grown tree, a quick dive) without visible speed jumps.
//
// story S 0–1.6       a seed falls and is sown, close up
// growth g = S − SOW
// g 0–4.6              roots, then the tree; the camera pulls back
// g 4.6–6.9            hold on the grown tree, headline A
// g 6.9–8.5            the dive into the trunk
// g 8.5–13             rings open, service labels, light pulses; headline B
// then a short fade to dark and the loop starts again

export const SOW = 1.6
/** real seconds per loop */
export const DURATION = 11
/** real seconds of fade to dark at the end of the loop */
export const FADE_OUT = 0.6

// [real t, story S]
const KEYS: [number, number][] = [
  [0, 0],
  [1.2, 1.6],
  [4.6, 7.9],
  [5.6, 8.5],
  [6.9, 10.1],
  [8.4, 11.6],
  [10.4, 14.2],
  [11, 14.6],
]

/** Fritsch–Carlson monotone cubic: smooth, never runs backwards. */
function monotone(keys: [number, number][]) {
  const xs = keys.map((k) => k[0])
  const ys = keys.map((k) => k[1])
  const n = keys.length
  const d = Array.from({ length: n - 1 }, (_, i) => (ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]))
  const m = Array.from({ length: n }, (_, i) => (i === 0 ? d[0] : i === n - 1 ? d[n - 2] : d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2))
  for (let i = 0; i < n - 1; i++) {
    const a = m[i] / d[i]
    const b = m[i + 1] / d[i]
    const s = a * a + b * b
    if (s > 9) {
      const tau = 3 / Math.sqrt(s)
      m[i] = tau * a * d[i]
      m[i + 1] = tau * b * d[i]
    }
  }
  return (x: number) => {
    const xc = clamp(x, xs[0], xs[n - 1])
    let i = 0
    while (i < n - 2 && xc > xs[i + 1]) i++
    const h = xs[i + 1] - xs[i]
    const t = (xc - xs[i]) / h
    const t2 = t * t
    const t3 = t2 * t
    return (2 * t3 - 3 * t2 + 1) * ys[i] + (t3 - 2 * t2 + t) * h * m[i] + (-2 * t3 + 3 * t2) * ys[i + 1] + (t3 - t2) * h * m[i + 1]
  }
}

export const storyAt = monotone(KEYS)

export const fade = (t: number, a: number, b: number, c: number, d: number) =>
  smoothstep(a, b, t) * (1 - smoothstep(c, d, t))

export function copyAt(t: number) {
  const g = storyAt(t) - SOW
  const end = 1 - smoothstep(DURATION - FADE_OUT, DURATION, t)
  return {
    headlineA: fade(g, 2.6, 3.6, 6.9, 7.6),
    subA: fade(g, 3.4, 4.3, 6.8, 7.4),
    headlineB: smoothstep(8.9, 9.6, g) * end,
    subB: smoothstep(9.4, 10.1, g) * end,
    /** the call to action never leaves */
    cta: 1,
    chapter: g < 8.5 ? 0 : 1,
    progress: clamp(t / (DURATION - FADE_OUT)),
  }
}

export const CHAPTERS = ['01 / From seed to canopy', '02 / Rings of growth'] as const
