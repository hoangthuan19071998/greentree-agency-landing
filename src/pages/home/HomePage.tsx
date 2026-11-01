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
import { MEDIA } from '@/config/site'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { useRevealOnScroll } from '@/hooks/useRevealOnScroll'
import { useScrollScene } from '@/hooks/useScrollScene'

export function HomePage() {
  // Pin only when the viewport has enough room for every panel. Tablets,
  // shorter windows and reduced motion use the same content stacked vertically.
  const reduceMotion = useMediaQuery(MEDIA.reducedMotion)
  const roomy = useMediaQuery(MEDIA.horizontalJourney)
  const horizontal = roomy && !reduceMotion

  const { rootRef, progressRef, journey } = useScrollScene(horizontal)
  useRevealOnScroll(rootRef)

  return (
    <div className={horizontal ? 'gt js js-hz' : 'gt js'} ref={rootRef}>
      <TreeRingSymbol />
      <CustomCursor />
      <TapRipple />

      <Navbar progressRef={progressRef} />
      <FilmHero />
      <HorizontalJourney journey={journey} />
      <ProcessSection />
      <SelectedWorkSection />
      <QuoteSection />
      <ContactSection />
    </div>
  )
}
