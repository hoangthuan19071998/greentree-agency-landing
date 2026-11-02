import { localize } from '@/i18n/lang'
import type { Lang, Localized } from '@/i18n/lang'

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

const source = [
  {
    num: '01',
    kicker: { en: 'Core', vi: 'Cốt lõi' },
    title: { en: 'Performance Ads', vi: 'Quảng cáo hiệu suất' },
    desc: {
      en: 'Meta, Google and TikTok campaigns built around your margins — not vanity metrics. Planned, tested and optimised weekly.',
      vi: 'Chiến dịch Meta, Google và TikTok xây quanh biên lợi nhuận của bạn — không chạy theo con số ảo. Lên kế hoạch, thử nghiệm và tối ưu hằng tuần.',
    },
    tags: ['Meta Ads', 'Google Ads', 'TikTok Ads'],
    image: '/images/service-performance-ads.jpg',
  },
  {
    num: '02',
    kicker: { en: 'Foundation', vi: 'Nền móng' },
    title: { en: 'Brand & Strategy', vi: 'Thương hiệu & Chiến lược' },
    desc: {
      en: 'Positioning, audience insight and a clear message — the roots every channel grows from.',
      vi: 'Định vị, thấu hiểu khách hàng và thông điệp rõ ràng — bộ rễ để mọi kênh cùng phát triển.',
    },
    tags: [
      'Positioning',
      { en: 'Audience research', vi: 'Nghiên cứu khách hàng' },
      { en: 'Messaging', vi: 'Thông điệp' },
    ],
    image: '/images/service-brand-strategy.jpg',
  },
  {
    num: '03',
    kicker: { en: 'Canopy', vi: 'Tán lá' },
    title: { en: 'Content & Social', vi: 'Nội dung & Mạng xã hội' },
    desc: {
      en: 'Creative that stops the scroll and stays on brand, from ad creatives to always-on social.',
      vi: 'Nội dung khiến người xem dừng lướt mà vẫn đúng chất thương hiệu, từ creative quảng cáo đến kênh social hằng ngày.',
    },
    tags: [
      { en: 'Ad creative', vi: 'Creative quảng cáo' },
      { en: 'Short video', vi: 'Video ngắn' },
      'Social',
    ],
    image: '/images/service-content-social.jpg',
  },
  {
    num: '04',
    kicker: { en: 'Ground', vi: 'Mặt đất' },
    title: { en: 'Web & Landing Pages', vi: 'Website & Landing page' },
    desc: {
      en: 'Fast, considered pages designed to turn paid traffic into customers.',
      vi: 'Những trang web nhanh, chỉn chu, được thiết kế để biến lượt truy cập từ quảng cáo thành khách hàng.',
    },
    tags: [{ en: 'Landing pages', vi: 'Landing page' }, 'CRO', 'Tracking'],
    image: '/images/service-web-landing.jpg',
  },
  {
    num: '05',
    kicker: { en: 'Long game', vi: 'Đường dài' },
    title: { en: 'SEO & Analytics', vi: 'SEO & Phân tích' },
    desc: {
      en: 'Organic growth and honest reporting, so every decision is rooted in data.',
      vi: 'Tăng trưởng tự nhiên và báo cáo minh bạch, để mọi quyết định đều bắt rễ từ dữ liệu.',
    },
    tags: ['SEO', 'GA4', 'Dashboards'],
    image: '/images/service-seo-analytics.jpg',
  },
]

const forLang = (lang: Lang): Service[] =>
  source.map((s, i) => ({ ...localize(s, lang), tone: tones[i] }))

export const servicesByLang: Localized<Service[]> = { en: forLang('en'), vi: forLang('vi') }

/** English, for pages without a language switch (/demo). */
export const services = servicesByLang.en
