import { localize } from '@/i18n/lang'
import type { Lang, Localized } from '@/i18n/lang'

export interface ProcessStep {
  letter: string
  num: string
  /** Kept in English in every language: the steps spell G.R.E.E.N. */
  name: string
  /** What the step means in the page's language; empty in English. */
  gloss: string
  desc: string
  /** Reveal stagger class (rv-d1 / rv-d2). */
  delay: '' | 'rv-d1' | 'rv-d2'
}

const source = [
  {
    letter: 'G',
    num: '01',
    name: 'Ground',
    gloss: { en: '', vi: 'Khảo sát' },
    desc: {
      en: 'We audit your market, competitors and current numbers to find solid footing.',
      vi: 'Phân tích thị trường, đối thủ và các chỉ số hiện tại để tìm nền móng vững chắc.',
    },
    delay: '',
  },
  {
    letter: 'R',
    num: '02',
    name: 'Root',
    gloss: { en: '', vi: 'Định hướng' },
    desc: {
      en: 'Strategy, audience and measurable goals — agreed before any budget is spent.',
      vi: 'Chiến lược, tệp khách hàng và mục tiêu đo lường được — thống nhất trước khi chi bất kỳ đồng ngân sách nào.',
    },
    delay: 'rv-d1',
  },
  {
    letter: 'E',
    num: '03',
    name: 'Engage',
    gloss: { en: '', vi: 'Triển khai' },
    desc: {
      en: 'Launch creative and campaigns across the channels where your customers are.',
      vi: 'Triển khai nội dung và chiến dịch trên đúng những kênh khách hàng của bạn đang có mặt.',
    },
    delay: 'rv-d2',
  },
  {
    letter: 'E',
    num: '04',
    name: 'Elevate',
    gloss: { en: '', vi: 'Tối ưu' },
    desc: {
      en: 'Test, learn and scale what works. Cut what doesn’t. Weekly.',
      vi: 'Thử nghiệm, rút kinh nghiệm và nhân rộng những gì hiệu quả. Cắt bỏ những gì không. Mỗi tuần.',
    },
    delay: 'rv-d1',
  },
  {
    letter: 'N',
    num: '05',
    name: 'Nurture',
    gloss: { en: '', vi: 'Đồng hành' },
    desc: {
      en: 'Transparent reporting and a long-term partnership that keeps growing.',
      vi: 'Báo cáo minh bạch và mối quan hệ đối tác lâu dài, cùng nhau tiếp tục lớn lên.',
    },
    delay: 'rv-d2',
  },
] as const

const forLang = (lang: Lang): ProcessStep[] => source.map((s) => localize(s, lang))

export const processStepsByLang: Localized<ProcessStep[]> = { en: forLang('en'), vi: forLang('vi') }

/** English, for pages without a language switch (/demo). */
export const processSteps = processStepsByLang.en

/** Hero acronym: capital letter + the rest of the word. */
export const heroAcronym = [
  ['G', 'round'],
  ['R', 'oot'],
  ['E', 'ngage'],
  ['E', 'levate'],
  ['N', 'urture'],
] as const
