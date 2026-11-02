import { FilmHero } from "@/components/FilmHero";
import { TreeRingSymbol } from "@/components/TreeRingSymbol";
import { MEDIA } from "@/config/site";
import { useInPageAnchors } from "@/hooks/useInPageAnchors";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useRevealOnScroll } from "@/hooks/useRevealOnScroll";
import { useScrollScene } from "@/hooks/useScrollScene";
import { CustomCursor } from "./components/CustomCursor";
import { Navbar } from "./components/Navbar";
import { TapRipple } from "./components/TapRipple";
import { ClientsSection } from "./sections/ClientsSection";
import { ContactSection } from "./sections/ContactSection";
import { HorizontalJourney } from "./sections/HorizontalJourney";
import { ProcessSection } from "./sections/ProcessSection";
import { QuoteSection } from "./sections/QuoteSection";
import { SelectedWorkSection } from "./sections/SelectedWorkSection";
import { StatsSection } from "./sections/StatsSection";

export function HomePage() {
  // Pin only when the viewport has enough room for every panel. Tablets,
  // shorter windows and reduced motion use the same content stacked vertically.
  const reduceMotion = useMediaQuery(MEDIA.reducedMotion);
  const roomy = useMediaQuery(MEDIA.horizontalJourney);
  const horizontal = roomy && !reduceMotion;

  const { rootRef, progressRef, journey } = useScrollScene(horizontal);
  useRevealOnScroll(rootRef);
  useInPageAnchors();

  return (
    <div className={horizontal ? "gt js js-hz" : "gt js"} ref={rootRef}>
      <TreeRingSymbol />
      <CustomCursor />
      <TapRipple />

      <Navbar progressRef={progressRef} />
      <FilmHero timing={{ speed: 0.7, phases: { hold: 1 } }} />
      <ClientsSection />
      <HorizontalJourney journey={journey} />
      <ProcessSection />
      <SelectedWorkSection />
      <StatsSection />
      <QuoteSection />
      <ContactSection />
    </div>
  );
}
