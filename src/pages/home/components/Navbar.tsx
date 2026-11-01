import type { FC, RefObject } from 'react'
import { useEffect, useRef, useState } from 'react'
import { COMPANY_PROFILE, LOGO, MEDIA, SECTION_LINKS } from '@/config/site'
import { RingButton } from '@/components/RingButton'

interface NavbarProps {
  progressRef?: RefObject<HTMLDivElement | null>
}

const NavLinks: FC<{ linkClass?: string; onNavigate?: () => void }> = ({
  linkClass,
  onNavigate,
}) => (
  <>
    {SECTION_LINKS.map((l) => (
      <a key={l.href} className={linkClass} href={l.href} onClick={onNavigate}>
        {l.label}
      </a>
    ))}
    <a
      className={linkClass}
      href={COMPANY_PROFILE.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={COMPANY_PROFILE.ariaLabel}
      onClick={onNavigate}
    >
      {COMPANY_PROFILE.label}
    </a>
  </>
)

export const Navbar: FC<NavbarProps> = ({ progressRef }) => {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

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

        <nav className="navlinks" aria-label="Main">
          <NavLinks linkClass="navlink" />
        </nav>

        <button
          ref={menuButtonRef}
          type="button"
          className="m-menu-btn"
          aria-label="Menu"
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

        <a className="m-book" href="#contact" aria-label="Book a call" onClick={closeMenu}>
          Book a call
        </a>

        <RingButton tone="light" className="hdr-btn" href="#contact">
          Book a call
        </RingButton>
      </div>

      {menuOpen && (
        <nav id="mobile-menu" className="m-menu" aria-label="Sections">
          <NavLinks onNavigate={closeMenu} />
        </nav>
      )}

      {/* Reading progress, driven by useScrollScene */}
      <div className="progress" ref={progressRef} />
    </header>
  )
}
