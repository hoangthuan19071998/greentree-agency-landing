import { localize } from '@/i18n/lang'
import type { Lang, Localized } from '@/i18n/lang'

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

const source = [
  {
    id: 'sel-de-mer',
    client: 'Sel de Mer Hotel & Suites',
    subtitle: 'Prince Hotel Danang',
    category: { en: 'Luxury Hospitality', vi: 'Khách sạn cao cấp' },
    channel: 'Google & Meta Ads',
    url: 'https://princehoteldanang.com',
    displayUrl: 'princehoteldanang.com',
    logo: '/partner_logo/httpsprincehoteldanang.com.jpg',
    stat1: { value: '5.8x', label: 'ROAS' },
    stat2: { value: '−42%', label: 'CPA' },
    highlight: { en: '+65% Direct Bookings', vi: '+65% đặt phòng trực tiếp' },
    description: {
      en: 'A multi-channel advertising strategy positioned this five-star beachfront hotel in Da Nang and drove direct bookings from domestic and international guests.',
      vi: 'Chiến lược quảng cáo đa kênh giúp định vị khách sạn 5 sao ven biển Đà Nẵng và tăng lượt đặt phòng trực tiếp từ khách trong nước lẫn quốc tế.',
    },
  },
  {
    id: 'adidas-danang',
    client: 'Adidas Da Nang',
    subtitle: { en: 'Official Retail Network', vi: 'Hệ thống bán lẻ chính hãng' },
    category: { en: 'Sportswear & Retail', vi: 'Thời trang thể thao & Bán lẻ' },
    channel: 'TikTok & Meta Ads',
    url: 'https://www.facebook.com/adidasdanang',
    displayUrl: 'facebook.com/adidasdanang',
    logo: '/partner_logo/httpswww.facebook.comadidasdanang.jpg',
    stat1: { value: '6.4x', label: 'ROAS' },
    stat2: { value: '−38%', label: 'CPA' },
    highlight: { en: '+125% Store Footfall', vi: '+125% lượt khách đến cửa hàng' },
    description: {
      en: 'Creative short-form TikTok campaigns paired with local advertising increased sales across the retail network.',
      vi: 'Chiến dịch video ngắn sáng tạo trên TikTok kết hợp quảng cáo địa phương giúp tăng doanh số trên toàn hệ thống cửa hàng.',
    },
  },
  {
    id: 'thaco-auto',
    client: 'THACO AUTO Da Nang',
    subtitle: { en: 'Authorized Showroom & Dealership', vi: 'Showroom & đại lý ủy quyền' },
    category: { en: 'Automotive & Mobility', vi: 'Ô tô & Di chuyển' },
    channel: 'Performance Lead Gen',
    url: 'https://thacoautodanang.vn',
    displayUrl: 'thacoautodanang.vn',
    logo: '/partner_logo/httpsthacoautodanang.vn.jpg',
    stat1: { value: '3,400+', label: { en: 'Qualified Leads', vi: 'Lead chất lượng' } },
    stat2: { value: '−32%', label: 'CPL' },
    highlight: { en: '4.9x Pipeline Value', vi: '4.9x giá trị cơ hội bán hàng' },
    description: {
      en: 'A streamlined test-drive lead funnel reduced acquisition costs while increasing the volume of qualified prospects.',
      vi: 'Phễu đăng ký lái thử được tinh gọn giúp giảm chi phí có khách hàng, đồng thời tăng số lượng khách tiềm năng chất lượng.',
    },
  },
  {
    id: 'ayi-bistro',
    client: 'Ayi Bistro',
    subtitle: { en: 'Contemporary Asian Cuisine', vi: 'Ẩm thực châu Á đương đại' },
    category: { en: 'F&B & Fine Dining', vi: 'F&B & Nhà hàng' },
    channel: { en: 'Meta Ads & Creative Content', vi: 'Meta Ads & Nội dung sáng tạo' },
    url: 'https://www.facebook.com/ayibistro',
    displayUrl: 'facebook.com/ayibistro',
    logo: '/partner_logo/ayibistro.jpg',
    stat1: { value: '4.6x', label: 'ROAS' },
    stat2: { value: '−28%', label: 'CPA' },
    highlight: { en: '+180% Reservations', vi: '+180% lượt đặt bàn' },
    description: {
      en: 'Distinctive food storytelling through photography and film attracted new diners and produced a sharp increase in reservations.',
      vi: 'Kể chuyện ẩm thực bằng hình ảnh và video giàu cá tính thu hút thực khách mới, giúp lượt đặt bàn tăng mạnh.',
    },
  },
  {
    id: 'enet-education',
    client: 'Enet Education',
    subtitle: { en: 'Enet International Training Institute', vi: 'Viện Đào tạo Quốc tế Enet' },
    category: { en: 'EdTech & Education', vi: 'Giáo dục & EdTech' },
    channel: 'Google Search & Meta Ads',
    url: 'https://enet.edu.vn',
    displayUrl: 'enet.edu.vn',
    logo: '/partner_logo/httpsenet.edu.vn.jpg',
    stat1: { value: '4.2x', label: 'ROAS' },
    stat2: { value: '−35%', label: 'CPA' },
    highlight: { en: '+210% Enrolled Students', vi: '+210% học viên đăng ký' },
    description: {
      en: 'A multi-channel enrollment funnel combined focused SEO with search advertising to increase conversions from prospective students.',
      vi: 'Phễu tuyển sinh đa kênh kết hợp SEO trọng tâm với quảng cáo tìm kiếm, giúp tăng chuyển đổi từ học viên tiềm năng.',
    },
  },
]

const forLang = (lang: Lang): WorkProject[] => source.map((p) => localize(p, lang))

export const workProjectsByLang: Localized<WorkProject[]> = { en: forLang('en'), vi: forLang('vi') }

/** Client names and logos, for the logo strip. */
export const clientLogos = source.map(({ id, client, logo }) => ({ id, client, logo }))

/** English, for pages without a language switch (/demo). */
export const workProjects = workProjectsByLang.en
