export const CONTACT = {
  email: 'contact@greentreevn.com',
  phone: '0359 943 961',
  phoneHref: 'tel:+84359943961',
} as const

// Built from the site's data by `npm run profile` (scripts/company-profile).
export const COMPANY_PROFILE = {
  href: '/greentree-company-profile.pdf',
  hrefByLang: {
    en: '/greentree-company-profile.pdf',
    vi: '/greentree-company-profile-vi.pdf',
  },
  label: 'Company Profile',
  ariaLabel: 'Open the Green Tree Agency company profile PDF in a new tab',
} as const

export const SECTION_LINKS = [
  { href: '#about', label: 'About' },
  { href: '#services', label: 'Services' },
  { href: '#process', label: 'Process' },
  { href: '#work', label: 'Work' },
] as const

export const LOGO = (size: 64 | 128 | 256) =>
  `/logo_image/gta-symbol-xanh-${size}.png`

// Keep in sync with the matching @media rules in index.css.
export const MEDIA = {
  reducedMotion: '(prefers-reduced-motion: reduce)',
  finePointer: '(pointer: fine)',
  // Wide nav vs. compact menu.
  desktopNav: '(min-width: 1101px)',
  // Pin the journey only when every panel fits; otherwise it stacks.
  horizontalJourney: '(min-width: 1101px) and (min-height: 800px)',
} as const
