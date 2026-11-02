import { localize } from '@/i18n/lang'
import type { Lang, Localized } from '@/i18n/lang'

export interface Stat {
  value: string
  label: string
  note: string
}

// Worked out from the case studies in work.ts: update both together.
const source = [
  {
    // ROAS of Sel de Mer, Adidas, Ayi Bistro and Enet: (5.8 + 6.4 + 4.6 + 4.2) / 4
    value: '5.2x',
    label: { en: 'Average ROAS', vi: 'ROAS trung bình' },
    note: { en: 'across our featured ad campaigns', vi: 'trên các chiến dịch quảng cáo tiêu biểu' },
  },
  {
    // CPA / CPL of all five: (42 + 38 + 32 + 28 + 35) / 5
    value: '−35%',
    label: { en: 'Cost per acquisition', vi: 'Chi phí mỗi chuyển đổi' },
    note: { en: 'average cut once campaigns were optimised', vi: 'giảm trung bình sau khi tối ưu chiến dịch' },
  },
  {
    value: '3,400+',
    label: { en: 'Qualified leads', vi: 'Lead chất lượng' },
    note: { en: 'test-drive requests for one auto dealership', vi: 'đăng ký lái thử cho một đại lý ô tô' },
  },
  {
    value: '5',
    label: { en: 'Industries', vi: 'Ngành hàng' },
    note: {
      en: 'hospitality, retail, automotive, F&B and education',
      vi: 'khách sạn, bán lẻ, ô tô, F&B và giáo dục',
    },
  },
]

const forLang = (lang: Lang): Stat[] => source.map((s) => localize(s, lang))

export const statsByLang: Localized<Stat[]> = { en: forLang('en'), vi: forLang('vi') }
