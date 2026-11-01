export interface ProcessStep {
  letter: string
  num: string
  name: string
  desc: string
  /** Reveal stagger class (rv-d1 / rv-d2). */
  delay: '' | 'rv-d1' | 'rv-d2'
}

export const processSteps: ProcessStep[] = [
  {
    letter: 'G',
    num: '01',
    name: 'Ground',
    desc: 'We audit your market, competitors and current numbers to find solid footing.',
    delay: '',
  },
  {
    letter: 'R',
    num: '02',
    name: 'Root',
    desc: 'Strategy, audience and measurable goals — agreed before any budget is spent.',
    delay: 'rv-d1',
  },
  {
    letter: 'E',
    num: '03',
    name: 'Engage',
    desc: 'Launch creative and campaigns across the channels where your customers are.',
    delay: 'rv-d2',
  },
  {
    letter: 'E',
    num: '04',
    name: 'Elevate',
    desc: 'Test, learn and scale what works. Cut what doesn’t. Weekly.',
    delay: 'rv-d1',
  },
  {
    letter: 'N',
    num: '05',
    name: 'Nurture',
    desc: 'Transparent reporting and a long-term partnership that keeps growing.',
    delay: 'rv-d2',
  },
]

/** Hero acronym: capital letter + the rest of the word. */
export const heroAcronym = [
  ['G', 'round'],
  ['R', 'oot'],
  ['E', 'ngage'],
  ['E', 'levate'],
  ['N', 'urture'],
] as const
