import { TreeRingSymbol } from '@/components/TreeRingSymbol'
import { CustomCursor } from './components/CustomCursor'
import { TapRipple } from './components/TapRipple'
import { Navbar } from './components/Navbar'
import { FilmHero } from '@/components/FilmHero'
import { HorizontalJourney } from './sections/HorizontalJourney'
import { ProcessSection } from './sections/ProcessSection'
import { SelectedWorkSection } from './sections/SelectedWorkSection'
import { QuoteSection } from './sections/QuoteSection'
import { ContactSection } from './sections/ContactSection'
import { FaqSection } from './sections/FaqSection'
import { SiteFooter } from './sections/SiteFooter'
import { MEDIA } from '@/config/site'
import { useInPageAnchors } from '@/hooks/useInPageAnchors'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useRevealOnScroll } from '@/hooks/useRevealOnScroll'
import { useScrollScene } from '@/hooks/useScrollScene'

export function DemoPage() {
  // Pin only when the viewport has enough room for every panel. Tablets,
  // shorter windows and reduced motion use the same content stacked vertically.
  const reduceMotion = useMediaQuery(MEDIA.reducedMotion)
  const roomy = useMediaQuery(MEDIA.horizontalJourney)
  const horizontal = roomy && !reduceMotion

  const { rootRef, progressRef, journey } = useScrollScene(horizontal)
  useRevealOnScroll(rootRef)
  useInPageAnchors()

  return (
    <div className={horizontal ? 'gt page-demo js js-hz' : 'gt page-demo js'} ref={rootRef}>
      <TreeRingSymbol />
      <CustomCursor />
      <TapRipple />

      <Navbar progressRef={progressRef} />
      <FilmHero />
      <HorizontalJourney journey={journey} />
      <ProcessSection />
      <SelectedWorkSection />
      <QuoteSection />
      <FaqSection />
      <ContactSection />
      <SiteFooter />
    </div>
  )
}
