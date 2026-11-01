import { clamp, smoothstep } from "./math";

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

export const SOW = 1.6;

/** The film's phases, in order. */
export type HeroPhase =
  | "sow"
  | "grow"
  | "hold"
  | "dive"
  | "bloom"
  | "rings"
  | "fade";
export type HeroPhases = Record<HeroPhase, number>;

/** Real seconds each phase lasts at speed 1 (11 s per loop). */
export const DEFAULT_PHASES: HeroPhases = {
  sow: 1.2, //   a seed falls and is sown, close up
  grow: 3.4, //  roots, then the tree; the camera pulls back
  hold: 1.0, //  the grown tree, headline A
  dive: 1.3, //  into the trunk
  bloom: 1.5, // the rings open from the heart
  rings: 2.0, // rings, service labels, light pulses, headline B
  fade: 0.6, //  to dark, then the loop starts again
};

// Where each phase ends on the story clock. This is the choreography and
// never changes; only the real time spent between these points does.
const STORY_ENDS: Record<HeroPhase, number> = {
  sow: 1.6,
  grow: 7.9,
  hold: 8.5,
  dive: 10.1,
  bloom: 11.6,
  rings: 14.2,
  fade: 14.6,
};
const ORDER: HeroPhase[] = [
  "sow",
  "grow",
  "hold",
  "dive",
  "bloom",
  "rings",
  "fade",
];

/** real seconds per loop */
export let DURATION = 0;
/** real seconds of fade to dark at the end of the loop */
export let FADE_OUT = 0;
/** real time t → story time S */
export let storyAt: (t: number) => number = (t) => t;

/** Fritsch–Carlson monotone cubic: smooth, never runs backwards. */
function monotone(keys: [number, number][]) {
  const xs = keys.map((k) => k[0]);
  const ys = keys.map((k) => k[1]);
  const n = keys.length;
  const d = Array.from(
    { length: n - 1 },
    (_, i) => (ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]),
  );
  const m = Array.from({ length: n }, (_, i) =>
    i === 0
      ? d[0]
      : i === n - 1
        ? d[n - 2]
        : d[i - 1] * d[i] <= 0
          ? 0
          : (d[i - 1] + d[i]) / 2,
  );
  for (let i = 0; i < n - 1; i++) {
    const a = m[i] / d[i];
    const b = m[i + 1] / d[i];
    const s = a * a + b * b;
    if (s > 9) {
      const tau = 3 / Math.sqrt(s);
      m[i] = tau * a * d[i];
      m[i + 1] = tau * b * d[i];
    }
  }
  return (x: number) => {
    const xc = clamp(x, xs[0], xs[n - 1]);
    let i = 0;
    while (i < n - 2 && xc > xs[i + 1]) i++;
    const h = xs[i + 1] - xs[i];
    const t = (xc - xs[i]) / h;
    const t2 = t * t;
    const t3 = t2 * t;
    return (
      (2 * t3 - 3 * t2 + 1) * ys[i] +
      (t3 - 2 * t2 + t) * h * m[i] +
      (-2 * t3 + 3 * t2) * ys[i + 1] +
      (t3 - t2) * h * m[i + 1]
    );
  };
}

export interface HeroTiming {
  /** overall tempo: 2 plays twice as fast, 0.5 at half speed (default 1) */
  speed?: number;
  /** real seconds for any phase, at speed 1; the others keep their defaults */
  phases?: Partial<HeroPhases>;
}

/**
 * Sets the hero film's tempo. Changes take effect on the next frame, and the
 * loop length, fade and progress bar follow.
 *
 *   setHeroTiming({ speed: 0.8 })                      // everything 20% slower
 *   setHeroTiming({ phases: { grow: 4.5, hold: 2 } }) // a slower growth, a longer hold
 *   setHeroTiming({ speed: 1.2, phases: { rings: 3 } })
 *   setHeroTiming()                                    // back to the defaults
 *
 * Returns the resulting loop length in seconds.
 */
export function setHeroTiming({ speed = 1, phases = {} }: HeroTiming = {}) {
  if (!(speed > 0))
    throw new RangeError(`setHeroTiming: speed must be > 0, got ${speed}`);
  const p = { ...DEFAULT_PHASES, ...phases };
  for (const phase of ORDER) {
    if (!(p[phase] > 0))
      throw new RangeError(
        `setHeroTiming: ${phase} must be > 0 seconds, got ${p[phase]}`,
      );
  }
  const keys: [number, number][] = [[0, 0]];
  let t = 0;
  for (const phase of ORDER) {
    starts[phase] = t;
    t += p[phase] / speed;
    ends[phase] = t;
    keys.push([t, STORY_ENDS[phase]]);
  }
  DURATION = t;
  FADE_OUT = p.fade / speed;
  storyAt = monotone(keys);
  return DURATION;
}

const starts = {} as HeroPhases;
const ends = {} as HeroPhases;

/** Real time at a point through a phase (0 = its start, 1 = its end), at the current timing. */
export const phaseTime = (phase: HeroPhase, at = 0.5) =>
  starts[phase] + (ends[phase] - starts[phase]) * at;

setHeroTiming({ speed: 0.5 });

export const fade = (t: number, a: number, b: number, c: number, d: number) =>
  smoothstep(a, b, t) * (1 - smoothstep(c, d, t));

export function copyAt(t: number) {
  const g = storyAt(t) - SOW;
  const end = 1 - smoothstep(DURATION - FADE_OUT, DURATION, t);
  return {
    headlineA: fade(g, 2.6, 3.6, 6.9, 7.6),
    subA: fade(g, 3.4, 4.3, 6.8, 7.4),
    headlineB: smoothstep(8.9, 9.6, g) * end,
    subB: smoothstep(9.4, 10.1, g) * end,
    /** the call to action never leaves */
    cta: 1,
    chapter: g < 8.5 ? 0 : 1,
    progress: clamp(t / (DURATION - FADE_OUT)),
  };
}

export const CHAPTERS = [
  "01 / From seed to canopy",
  "02 / Rings of growth",
] as const;
