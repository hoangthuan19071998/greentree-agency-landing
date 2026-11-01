export interface Service {
  num: string
  kicker: string
  title: string
  desc: string
  tags: string[]
  image: string
  tone: ServiceTone
}

interface ServiceTone {
  bg: string
  fg: string
  ph: string
  line: string
}

const tones: ServiceTone[] = [
  { bg: '#E4E5DA', fg: '#14261E', ph: '#CFD3C3', line: '#9AA690' },
  { bg: '#1F3A2E', fg: '#F2F1EA', ph: '#2A4A3B', line: '#4A6E5A' },
  { bg: '#D6DCC8', fg: '#14261E', ph: '#C2CBB0', line: '#8E9C82' },
  { bg: '#14261E', fg: '#F2F1EA', ph: '#1F3A2E', line: '#3B5E4C' },
  { bg: '#ECEBE2', fg: '#14261E', ph: '#D9DACC', line: '#A3AA98' },
]

export const services: Service[] = [
  {
    num: '01',
    kicker: 'Core',
    title: 'Performance Ads',
    desc: 'Meta, Google and TikTok campaigns built around your margins — not vanity metrics. Planned, tested and optimised weekly.',
    tags: ['Meta Ads', 'Google Ads', 'TikTok Ads'],
    image: '/images/service-performance-ads.jpg',
  },
  {
    num: '02',
    kicker: 'Foundation',
    title: 'Brand & Strategy',
    desc: 'Positioning, audience insight and a clear message — the roots every channel grows from.',
    tags: ['Positioning', 'Audience research', 'Messaging'],
    image: '/images/service-brand-strategy.jpg',
  },
  {
    num: '03',
    kicker: 'Canopy',
    title: 'Content & Social',
    desc: 'Creative that stops the scroll and stays on brand, from ad creatives to always-on social.',
    tags: ['Ad creative', 'Short video', 'Social'],
    image: '/images/service-content-social.jpg',
  },
  {
    num: '04',
    kicker: 'Ground',
    title: 'Web & Landing Pages',
    desc: 'Fast, considered pages designed to turn paid traffic into customers.',
    tags: ['Landing pages', 'CRO', 'Tracking'],
    image: '/images/service-web-landing.jpg',
  },
  {
    num: '05',
    kicker: 'Long game',
    title: 'SEO & Analytics',
    desc: 'Organic growth and honest reporting, so every decision is rooted in data.',
    tags: ['SEO', 'GA4', 'Dashboards'],
    image: '/images/service-seo-analytics.jpg',
  },
].map((s, i) => ({ ...s, tone: tones[i] }))
