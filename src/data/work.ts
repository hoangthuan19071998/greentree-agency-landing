export interface WorkProject {
  id: string
  client: string
  subtitle: string
  category: string
  channel: string
  url: string
  displayUrl: string
  logo: string
  stat1: { value: string; label: string }
  stat2: { value: string; label: string }
  highlight: string
  description: string
}

export const workProjects: WorkProject[] = [
  {
    id: 'sel-de-mer',
    client: 'Sel de Mer Hotel & Suites',
    subtitle: 'Prince Hotel Danang',
    category: 'Luxury Hospitality',
    channel: 'Google & Meta Ads',
    url: 'https://princehoteldanang.com',
    displayUrl: 'princehoteldanang.com',
    logo: '/partner_logo/httpsprincehoteldanang.com.jpg',
    stat1: { value: '5.8x', label: 'ROAS' },
    stat2: { value: '−42%', label: 'CPA' },
    highlight: '+65% Direct Bookings',
    description:
      'A multi-channel advertising strategy positioned this five-star beachfront hotel in Da Nang and drove direct bookings from domestic and international guests.',
  },
  {
    id: 'adidas-danang',
    client: 'Adidas Da Nang',
    subtitle: 'Official Retail Network',
    category: 'Sportswear & Retail',
    channel: 'TikTok & Meta Ads',
    url: 'https://www.facebook.com/adidasdanang',
    displayUrl: 'facebook.com/adidasdanang',
    logo: '/partner_logo/httpswww.facebook.comadidasdanang.jpg',
    stat1: { value: '6.4x', label: 'ROAS' },
    stat2: { value: '−38%', label: 'CPA' },
    highlight: '+125% Store Footfall',
    description:
      'Creative short-form TikTok campaigns paired with local advertising increased sales across the retail network.',
  },
  {
    id: 'thaco-auto',
    client: 'THACO AUTO Da Nang',
    subtitle: 'Authorized Showroom & Dealership',
    category: 'Automotive & Mobility',
    channel: 'Performance Lead Gen',
    url: 'https://thacoautodanang.vn',
    displayUrl: 'thacoautodanang.vn',
    logo: '/partner_logo/httpsthacoautodanang.vn.jpg',
    stat1: { value: '3,400+', label: 'Qualified Leads' },
    stat2: { value: '−32%', label: 'CPL' },
    highlight: '4.9x Pipeline Value',
    description:
      'A streamlined test-drive lead funnel reduced acquisition costs while increasing the volume of qualified prospects.',
  },
  {
    id: 'ayi-bistro',
    client: 'Ayi Bistro',
    subtitle: 'Contemporary Asian Cuisine',
    category: 'F&B & Fine Dining',
    channel: 'Meta Ads & Creative Content',
    url: 'https://www.facebook.com/ayibistro',
    displayUrl: 'facebook.com/ayibistro',
    logo: '/partner_logo/ayibistro.jpg',
    stat1: { value: '4.6x', label: 'ROAS' },
    stat2: { value: '−28%', label: 'CPA' },
    highlight: '+180% Reservations',
    description:
      'Distinctive food storytelling through photography and film attracted new diners and produced a sharp increase in reservations.',
  },
  {
    id: 'enet-education',
    client: 'Enet Education',
    subtitle: 'Enet International Training Institute',
    category: 'EdTech & Education',
    channel: 'Google Search & Meta Ads',
    url: 'https://enet.edu.vn',
    displayUrl: 'enet.edu.vn',
    logo: '/partner_logo/httpsenet.edu.vn.jpg',
    stat1: { value: '4.2x', label: 'ROAS' },
    stat2: { value: '−35%', label: 'CPA' },
    highlight: '+210% Enrolled Students',
    description:
      'A multi-channel enrollment funnel combined focused SEO with search advertising to increase conversions from prospective students.',
  },
]
