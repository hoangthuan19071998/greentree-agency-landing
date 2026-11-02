import type { FC, ReactNode, TouchEvent } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, ExternalLink, TrendingUp } from 'lucide-react'
import { MEDIA } from '@/config/site'
import { workProjectsByLang } from '@/data/work'
import type { WorkProject } from '@/data/work'
import { matches, useMediaQuery } from '@/hooks/useMediaQuery'
import { useCopy } from '@/i18n/lang'
import type { Localized } from '@/i18n/lang'

const copy: Localized<{
  eyebrow: string
  title: ReactNode
  lede: string
  prevProject: string
  nextProject: string
  prevSlide: string
  nextSlide: string
  goToPage: (n: number) => string
  visit: string
  logoAlt: (client: string) => string
}> = {
  en: {
    eyebrow: 'Case Studies & Partners',
    title: (
      <>
        Selected <em className="accent-moss">work</em>
      </>
    ),
    lede: 'Real partnerships with leading brands in Da Nang and across Vietnam — measured through performance and sustainable growth.',
    prevProject: 'Previous project',
    nextProject: 'Next project',
    prevSlide: 'Previous slide',
    nextSlide: 'Next slide',
    goToPage: (n) => `Go to page ${n}`,
    visit: 'Visit',
    logoAlt: (client) => `${client} logo`,
  },
  vi: {
    eyebrow: 'Dự án & Đối tác',
    title: (
      <>
        Dự án <em className="accent-moss">tiêu biểu</em>
      </>
    ),
    lede: 'Hợp tác thực tế với những thương hiệu hàng đầu tại Đà Nẵng và khắp Việt Nam — đo bằng hiệu quả và tăng trưởng bền vững.',
    prevProject: 'Dự án trước',
    nextProject: 'Dự án tiếp theo',
    prevSlide: 'Trang trước',
    nextSlide: 'Trang sau',
    goToPage: (n) => `Đến trang ${n}`,
    visit: 'Xem',
    logoAlt: (client) => `Logo ${client}`,
  },
}

const SWIPE_THRESHOLD = 45
const AUTOPLAY_MS = 6000

const ctrlBtn =
  'w-12 h-12 rounded-full border border-heartwood/30 text-heartwood flex items-center justify-center hover:bg-heartwood hover:text-linen hover:border-heartwood transition-all duration-300 shadow-sm hover:scale-105 active:scale-95 cursor-pointer'
const sideBtn =
  'hidden lg:flex absolute top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/95 backdrop-blur-md border border-heartwood/15 text-heartwood items-center justify-center shadow-lg hover:bg-heartwood hover:text-white transition-all duration-300 opacity-0 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moss hover:scale-110 cursor-pointer z-10'

/** Cards per view and gap (px) for the current viewport. */
function useCarouselLayout() {
  const phone = useMediaQuery('(max-width: 639px)')
  const tablet = useMediaQuery('(max-width: 1119px)')
  if (phone) return { perView: 1, gap: 16 }
  if (tablet) return { perView: 2, gap: 20 }
  return { perView: 3, gap: 24 }
}

export const SelectedWorkSection: FC = () => {
  const t = useCopy(copy)
  const workProjects = useCopy(workProjectsByLang)
  const { perView, gap } = useCarouselLayout()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const touchDeltaX = useRef(0)

  const maxIndex = Math.max(0, workProjects.length - perView)
  const activeIndex = Math.min(currentIndex, maxIndex)

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => {
      const current = Math.min(prev, maxIndex)
      return current <= 0 ? maxIndex : current - 1
    })
  }, [maxIndex])

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => {
      const current = Math.min(prev, maxIndex)
      return current >= maxIndex ? 0 : current + 1
    })
  }, [maxIndex])

  // Autoplay, paused while hovered/focused and under reduced motion.
  useEffect(() => {
    if (isHovered || maxIndex <= 0 || matches(MEDIA.reducedMotion)) return
    const timer = setInterval(handleNext, AUTOPLAY_MS)
    return () => clearInterval(timer)
  }, [isHovered, maxIndex, handleNext])

  const onTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX
    touchDeltaX.current = 0
  }

  const onTouchMove = (e: TouchEvent) => {
    if (touchStartX.current !== null) {
      touchDeltaX.current = e.targetTouches[0].clientX - touchStartX.current
    }
  }

  const onTouchEnd = () => {
    if (touchStartX.current === null) return
    const delta = touchDeltaX.current
    if (delta > SWIPE_THRESHOLD) handlePrev()
    else if (delta < -SWIPE_THRESHOLD) handleNext()
    touchStartX.current = null
    touchDeltaX.current = 0
  }

  const sideBtnStyle = isHovered ? { opacity: 1, pointerEvents: 'auto' as const } : undefined

  return (
    <section id="work" className="pad wrap work relative overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-moss" />
            <span className="work-eyebrow">{t.eyebrow}</span>
          </div>
          <h2 className="serif rv work-title">{t.title}</h2>
          <p className="rv text-sm md:text-base text-bark font-light mt-3 max-w-[580px] leading-[1.6]">
            {t.lede}
          </p>
        </div>

        <div className="flex items-center gap-5 shrink-0">
          <div className="text-[13px] tabular-nums text-stone tracking-[0.06em] hidden sm:block">
            <span className="text-heartwood font-semibold">0{activeIndex + 1}</span> / 0{maxIndex + 1}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrev} aria-label={t.prevProject} className={ctrlBtn}>
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={handleNext} aria-label={t.nextProject} className={ctrlBtn}>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setIsHovered(false)
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className="overflow-hidden py-3 -my-3 px-1 -mx-1">
          <div
            className="work-track"
            style={{
              gap: `${gap}px`,
              transform: `translateX(calc(-${activeIndex} * (100% + ${gap}px) / ${perView}))`,
            }}
          >
            {workProjects.map((project) => (
              <div
                key={project.id}
                className="min-w-0"
                style={{ flex: `0 0 calc((100% - ${(perView - 1) * gap}px) / ${perView})` }}
              >
                <WorkCard project={project} visit={t.visit} logoAlt={t.logoAlt(project.client)} />
              </div>
            ))}
          </div>
        </div>

        {/* Side arrows: shown on desktop hover */}
        <button onClick={handlePrev} aria-label={t.prevSlide} className={`${sideBtn} -left-5`} style={sideBtnStyle}>
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={handleNext} aria-label={t.nextSlide} className={`${sideBtn} -right-5`} style={sideBtnStyle}>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="flex justify-center items-center mt-6">
        {Array.from({ length: maxIndex + 1 }, (_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            aria-label={t.goToPage(idx + 1)}
            className="w-11 h-11 flex items-center justify-center cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-moss"
          >
            <span
              className={`block h-2 rounded-full transition-all duration-400 ${
                activeIndex === idx ? 'w-8 bg-heartwood' : 'w-2 bg-rule-light'
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  )
}

const metricValue = 'block text-base sm:text-lg lg:text-xl font-semibold text-heartwood'
const metricLabel = 'text-xs sm:text-[13px] uppercase tracking-[0.06em] text-stone whitespace-nowrap'

const WorkCard: FC<{ project: WorkProject; visit: string; logoAlt: string }> = ({
  project,
  visit,
  logoAlt,
}) => (
  <a
    href={project.url}
    target="_blank"
    rel="noopener noreferrer"
    className="group block h-full bg-pith rounded-2xl border border-[#DFE3D9] hover:border-moss transition-all duration-400 hover:-translate-y-2 hover:shadow-[0_20px_35px_-10px_rgba(20,38,30,0.12)] p-5 sm:p-6 no-underline text-inherit flex flex-col justify-between"
  >
    <div>
      <div className="relative aspect-[16/9] w-full rounded-xl bg-white border border-[#E9ECE4] flex items-center justify-center p-4 sm:p-5 overflow-hidden mb-5 shadow-xs group-hover:shadow-md transition-shadow duration-300">
        <span className="absolute top-3 left-3 z-10 text-xs sm:text-[13px] font-medium tracking-[0.06em] uppercase px-2.5 py-1 rounded-full bg-linen text-canopy border border-[#D5DCD2]">
          {project.category}
        </span>
        <span className="absolute bottom-3 right-3 z-10 text-xs sm:text-[13px] font-medium px-2.5 py-1 rounded-full bg-heartwood text-linen flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm">
          <span>{visit}</span>
          <ExternalLink className="w-3 h-3" />
        </span>
        <img
          src={project.logo}
          alt={logoAlt}
          className="max-h-[75%] max-w-[70%] object-contain filter group-hover:scale-108 transition-transform duration-500 ease-out"
          loading="lazy"
        />
      </div>

      <div className="flex flex-col items-start text-xs mb-2.5 gap-1">
        <span className="font-semibold tracking-[0.06em] uppercase text-moss text-xs sm:text-[13px]">
          {project.channel}
        </span>
        <span className="text-stone text-xs sm:text-[13px] max-w-full flex items-center gap-1 group-hover:text-heartwood transition-colors">
          <span className="truncate">{project.displayUrl}</span>
          <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-70" />
        </span>
      </div>

      <h3 className="serif text-[25px] sm:text-[28px] lg:text-[30px] font-normal text-heartwood group-hover:text-moss transition-colors leading-tight mb-2.5 tracking-[-0.015em]">
        {project.client}
      </h3>

      <p className="text-xs sm:text-sm text-stone leading-relaxed font-light mb-5 min-h-[58px] sm:min-h-[66px]">
        {project.description}
      </p>
    </div>

    <div className="pt-4 border-t border-[#DFE3D9] mt-auto">
      <div className="work-metrics">
        <div>
          <span className={metricValue}>{project.stat1.value}</span>
          <span className={metricLabel}>{project.stat1.label}</span>
        </div>
        <div className="text-center">
          <span className={metricValue}>{project.stat2.value}</span>
          <span className={metricLabel}>{project.stat2.label}</span>
        </div>
        <div className="work-highlight">
          <span className="work-growth">
            <TrendingUp className="work-growth-icon" aria-hidden="true" />
            <span>{project.highlight}</span>
          </span>
        </div>
      </div>
    </div>
  </a>
)
