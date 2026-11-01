import { Color } from 'three'

// Design-system tokens (Green Tree Design System) plus the material colours
// the 3D world needs. UI tokens first; world-only colours are marked.
export const HEX = {
  heartwood: '#14261e',
  canopy: '#1f3a2e',
  moss: '#3e6b52',
  lichen: '#c9d8b0',
  linen: '#f2f1ea',
  sunlight: '#ddb56b',
  // world-only
  skyLow: '#08130e',
  skyHigh: '#163024',
  fog: '#10241a',
  soil: '#231b14',
  barkBase: '#3a3127',
  woodLight: '#b98a52',
  woodDark: '#4a2f1a',
  grass: '#4c6f3a',
  mossWorld: '#5d7a35',
} as const

export const col = (k: keyof typeof HEX) => new Color(HEX[k])
