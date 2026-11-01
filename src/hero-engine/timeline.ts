import { clamp, keyed } from './math'

// One continuous shot: the tree grows from seed to mature tree while the camera
// pulls back; then the only cut-like move, a dive into the trunk that opens
// onto the growth rings. 16 s, looping through a dark fade.

export const DURATION = 16

export const STAGES = [
  { id: 'seed', label: 'Seed', at: 0 },
  { id: 'growth', label: 'Growth', at: 2.2 },
  { id: 'canopy', label: 'Canopy', at: 5.6 },
  { id: 'mature', label: 'Mature tree', at: 9.6 },
  { id: 'rings', label: 'Tree rings', at: 12.4 },
  { id: 'beyond', label: 'Beyond', at: 15.0 },
] as const

/** Frames used for the stage stills. */
export const STILLS = [
  { id: '1-seed', t: 0.9 },
  { id: '2-sprout', t: 3.0 },
  { id: '3-sapling', t: 5.9 },
  { id: '4-young-tree', t: 8.6 },
  { id: '5-mature-tree', t: 11.8 },
  { id: '6-into-the-trunk', t: 13.35 },
  { id: '7-rings', t: 14.9 },
  { id: '8-beyond', t: 15.55 },
] as const

export const T_GROW_END = 12.4
export const T_CUT = 13.9
export const T_SWIRL = 15.0

const GROWTH: [number, number][] = [
  [0, 0],
  [1.2, 0.03],
  [3.0, 0.11],
  [6.0, 0.33],
  [9.0, 0.66],
  [11.4, 1],
]

const FADE: [number, number][] = [
  [0, 1],
  [0.5, 0],
  [13.45, 0],
  [13.85, 1],
  [13.95, 1],
  [14.35, 0],
  [15.5, 0],
  [16, 1],
]

export type Phase = 'grow' | 'dive' | 'rings'

export interface ShotState {
  t: number
  g: number
  phase: Phase
  /** 0→1 progress of the dive into the trunk */
  dive: number
  /** 0→1 reveal of the rings, then 0→1 swirl */
  reveal: number
  swirl: number
  fade: number
}

export function shotAt(time: number): ShotState {
  const t = ((time % DURATION) + DURATION) % DURATION
  const g = keyed(GROWTH, t, (x) => x)
  const fade = keyed(FADE, t, (x) => x * x * (3 - 2 * x))
  if (t < T_GROW_END) return { t, g, phase: 'grow', dive: 0, reveal: 0, swirl: 0, fade }
  if (t < T_CUT) return { t, g: 1, phase: 'dive', dive: clamp((t - T_GROW_END) / (T_CUT - T_GROW_END)), reveal: 0, swirl: 0, fade }
  return {
    t,
    g: 1,
    phase: 'rings',
    dive: 1,
    reveal: clamp((t - T_CUT) / (T_SWIRL - T_CUT)),
    swirl: clamp((t - T_SWIRL) / (DURATION - T_SWIRL)),
    fade,
  }
}
