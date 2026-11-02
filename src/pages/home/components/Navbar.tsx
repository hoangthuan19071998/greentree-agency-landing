import type { FC, RefObject } from 'react'
import { useEffect, useRef, useState } from 'react'
import { COMPANY_PROFILE, LOGO, MEDIA, SECTION_LINKS } from '@/config/site'
import { RingButton } from '@/components/RingButton'
import { LANGS, useCopy, useLang } from '@/i18n/lang'
import type { Localized } from '@/i18n/lang'

interface NavbarProps {
  progressRef?: RefObject<HTMLDivElement | null>
}

const copy: Localized<{
  links: Record<(typeof SECTION_LINKS)[number]['href'], string>
  profile: string
  profileAria: string
  book: string
  /** the phone-width pill */
  bookShort: string
  menu: string
  mainNav: string
  sectionsNav: string
  langGroup: string
}> = {
  en: {
    links: { '#about': 'About', '#services': 'Services', '#process': 'Process', '#work': 'Work' },
    profile: COMPANY_PROFILE.label,
    profileAria: COMPANY_PROFILE.ariaLabel,
    book: 'Book a call',
    bookShort: 'Book a call',
    menu: 'Menu',
    mainNav: 'Main',
    sectionsNav: 'Sections',
    langGroup: 'Language',
  },
  vi: {
    links: { '#about': 'Giới thiệu', '#services': 'Dịch vụ', '#process': 'Quy trình', '#work': 'Dự án' },
    profile: 'Hồ sơ năng lực',
    profileAria: 'Mở hồ sơ năng lực Green Tree Agency (PDF) trong tab mới',
    book: 'Đặt lịch tư vấn',
    bookShort: 'Đặt lịch',
    menu: 'Menu',
    mainNav: 'Điều hướng chính',
    sectionsNav: 'Các mục',
    langGroup: 'Ngôn ngữ',
  },
}

const LANG_NAMES: Localized = { en: 'English', vi: 'Tiếng Việt' }

const NavLinks: FC<{ linkClass?: string; onNavigate?: () => void }> = ({
  linkClass,
  onNavigate,
}) => {
  const t = useCopy(copy)
  const { lang } = useLang()
  return (
    <>
      {SECTION_LINKS.map((l) => (
        <a key={l.href} className={linkClass} href={l.href} onClick={onNavigate}>
          {t.links[l.href]}
        </a>
      ))}
      <a
        className={linkClass}
        href={COMPANY_PROFILE.hrefByLang[lang]}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t.profileAria}
        onClick={onNavigate}
      >
        {t.profile}
      </a>
    </>
  )
}

/** EN | VI segmented switch. */
const LangSwitch: FC<{ className?: string }> = ({ className }) => {
  const { lang, setLang } = useLang()
  const t = useCopy(copy)
  return (
    <div className={`lang-switch${className ? ` ${className}` : ''}`} role="group" aria-label={t.langGroup}>
      {LANGS.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          className="lang-opt"
          aria-pressed={lang === l}
          aria-label={LANG_NAMES[l]}
          onClick={() => setLang(l)}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

export const Navbar: FC<NavbarProps> = ({ progressRef }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const t = useCopy(copy)

  // While the compact menu is open: Esc closes it, and widening to the
  // desktop nav closes it too.
  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setMenuOpen(false)
      menuButtonRef.current?.focus()
    }
    const mq = window.matchMedia(MEDIA.desktopNav)
    const onMq = () => mq.matches && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    mq.addEventListener('change', onMq)
    return () => {
      window.removeEventListener('keydown', onKey)
      mq.removeEventListener('change', onMq)
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="site-header">
      <div className="pad site-header-bar">
        <a href="#top" className="brand" onClick={closeMenu}>
          <span className="brand-mark">
            <img src={LOGO(128)} alt="Green Tree Agency Logo" width={32} height={32} />
          </span>
          <span className="serif brand-name">Green Tree</span>
          <span className="brand-tag">Agency</span>
        </a>

        <nav className="navlinks" aria-label={t.mainNav}>
          <NavLinks linkClass="navlink" />
        </nav>

        <LangSwitch />

        <button
          ref={menuButtonRef}
          type="button"
          className="m-menu-btn"
          aria-label={t.menu}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d={menuOpen ? 'M6 6l12 12M18 6L6 18' : 'M4 7h16M4 12h16M4 17h16'} />
          </svg>
        </button>

        <a className="m-book" href="#contact" aria-label={t.book} onClick={closeMenu}>
          {t.bookShort}
        </a>

        <RingButton tone="light" className="hdr-btn" href="#contact">
          {t.book}
        </RingButton>
      </div>

      {menuOpen && (
        <nav id="mobile-menu" className="m-menu" aria-label={t.sectionsNav}>
          <NavLinks onNavigate={closeMenu} />
          {/* phones: the switch moves here from the bar */}
          <LangSwitch className="lang-switch-menu" />
        </nav>
      )}

      {/* Reading progress, driven by useScrollScene */}
      <div className="progress" ref={progressRef} />
    </header>
  )
}
