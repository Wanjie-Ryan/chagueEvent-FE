import { useState, useRef, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Pause, Play, ChevronLeft, ChevronRight } from "lucide-react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import NowPlayingWidget from "@/components/NowPlayingWidget";
import heroBanner from "@/assets/hero-banner.jpg";

type Slide = {
  type: "image" | "video";
  src: string;
  headline: string;
  subtitle: string;
  description: string;
  ctaPrimary: { label: string; to: string };
  ctaSecondary: { label: string; to: string | null };
};

const defaultSlides: Slide[] = [
  {
    type: "image",
    src: heroBanner,
    headline: "'UNFORGETTABLE EVENTS'",
    subtitle: "Create Memories",
    description: "Where style meets rhythm. Discover Kenya's premier event service providers and book your dream team today.",
    ctaPrimary: { label: "Explore Directory", to: "/products" },
    ctaSecondary: { label: "Learn More", to: "/products" },
  },
  {
    type: "video",
    src: "/videos/hero-video.mp4",
    headline: "EXQUISITE TASTES",
    subtitle: "The Catering Collection",
    description: "From dazzling decor to spectacular dining — outfit your occasion with the very best.",
    ctaPrimary: { label: "Find Caterers", to: "/products?category=catering" },
    ctaSecondary: { label: "Watch", to: null },
  },
  {
    type: "video",
    src: "/videos/seasonal-campaign.mp4",
    headline: "PREMIUM VENUES",
    subtitle: "Set the Stage",
    description: "Exclusive locations for exclusive moments. Your incredible event starts with the perfect space.",
    ctaPrimary: { label: "View Spaces", to: "/products?category=venue" },
    ctaSecondary: { label: "Learn More", to: null },
  },
];

const HeroBanner = () => {
  const { data: settings } = useSiteSettings();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Build slides from settings or defaults
  const slides: Slide[] = (() => {
    const heroData = settings?.hero_slides;
    if (heroData && Array.isArray(heroData) && heroData.length > 0) {
      return heroData.map((s: any) => ({
        type: s.type || "image",
        src: s.src || "",
        headline: s.headline || "",
        subtitle: s.subtitle || "",
        description: s.description || "",
        ctaPrimary: { label: s.ctaPrimaryLabel || "Shop Now", to: s.ctaPrimaryTo || "/products" },
        ctaSecondary: { label: s.ctaSecondaryLabel || "Learn More", to: s.ctaSecondaryTo || null },
      }));
    }
    return defaultSlides;
  })();

  const currentSlide = slides[activeIndex] || slides[0];

  const getActiveVideo = useCallback(() => {
    return videoRefs.current[activeIndex] ?? null;
  }, [activeIndex]);

  const goTo = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const next = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Reset progress on slide change
  useEffect(() => {
    setProgress(0);
  }, [activeIndex]);

  // Pause all non-active videos
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (v && i !== activeIndex) {
        v.pause();
        v.currentTime = 0;
      }
    });
  }, [activeIndex]);

  // Auto-advance for image slides + progress
  useEffect(() => {
    if (isPaused || currentSlide.type !== "image") return;
    const duration = 6000;
    const tick = 50;
    progressRef.current = setInterval(() => {
      setProgress((p) => Math.min(p + tick / duration, 1));
    }, tick);
    intervalRef.current = setInterval(next, duration);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [activeIndex, isPaused, currentSlide.type, next]);

  // Video: play active, track progress, auto-advance when it ends
  useEffect(() => {
    const video = getActiveVideo();
    if (!video || currentSlide.type !== "video") return;

    video.currentTime = 0;
    if (!isPaused) video.play().catch(() => {});

    const handleTimeUpdate = () => {
      if (video.duration) setProgress(video.currentTime / video.duration);
    };
    const handleEnded = () => next();
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, [activeIndex, isPaused, currentSlide.type, next, getActiveVideo]);

  const togglePause = () => {
    setIsPaused((p) => {
      const paused = !p;
      const video = getActiveVideo();
      if (currentSlide.type === "video" && video) {
        paused ? video.pause() : video.play().catch(() => {});
      }
      return paused;
    });
  };

  // Reset activeIndex if slides length changes
  useEffect(() => {
    if (activeIndex >= slides.length) setActiveIndex(0);
  }, [slides.length, activeIndex]);

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative h-[70vh] md:h-[80vh]">
        {slides.map((slide, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === activeIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {slide.type === "image" ? (
              <img
                src={slide.src}
                alt="Style n Tunes collection"
                className="h-full w-full object-cover"
                loading={i === 0 ? "eager" : "lazy"}
              />
            ) : (
              <video
                ref={(el) => { videoRefs.current[i] = el; }}
                src={slide.src}
                muted
                playsInline
                preload={i === 0 ? "auto" : "metadata"}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        ))}

        {/* Overlay */}
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-end pb-20 text-center px-4">
          <p className="font-body text-xs tracking-[0.3em] text-primary-foreground/70 uppercase mb-3">
            {currentSlide.subtitle}
          </p>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-primary-foreground mb-3 leading-none">
            {currentSlide.headline}
          </h1>
          <p className="font-body text-sm md:text-base text-primary-foreground/70 mb-6 max-w-md">
            {currentSlide.description}
          </p>
          
          {/* Now Playing Widget */}
          <div className="mb-6">
            <NowPlayingWidget />
          </div>

          <div className="flex gap-3">
            <Link
              to={currentSlide.ctaPrimary.to}
              className="bg-primary-foreground text-primary px-8 py-3 rounded-full font-body text-sm font-medium hover:bg-primary-foreground/90 transition-colors"
            >
              {currentSlide.ctaPrimary.label}
            </Link>
            {currentSlide.ctaSecondary.to ? (
              <Link
                to={currentSlide.ctaSecondary.to}
                className="border border-primary-foreground text-primary-foreground px-8 py-3 rounded-full font-body text-sm font-medium hover:bg-primary-foreground/10 transition-colors"
              >
                {currentSlide.ctaSecondary.label}
              </Link>
            ) : (
              <button
                onClick={() => {
                  const video = getActiveVideo();
                  if (currentSlide.type === "video" && video) {
                    video.scrollIntoView({ behavior: "smooth" });
                    if (video.paused) video.play().catch(() => {});
                  }
                }}
                className="border border-primary-foreground text-primary-foreground px-8 py-3 rounded-full font-body text-sm font-medium hover:bg-primary-foreground/10 transition-colors inline-flex items-center gap-2"
              >
                {currentSlide.ctaSecondary.label}
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
            )}
          </div>
        </div>

        {/* Controls — bottom right */}
        <div className="absolute bottom-6 right-6 z-30 flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === activeIndex
                    ? "bg-primary-foreground scale-125"
                    : "bg-primary-foreground/40 hover:bg-primary-foreground/60"
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={togglePause}
            className="relative w-10 h-10 flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/10 rounded-full transition-colors"
            aria-label={isPaused ? "Play" : "Pause"}
          >
            <svg className="absolute inset-0 w-10 h-10 -rotate-90" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="18" fill="none" stroke="hsl(var(--primary-foreground) / 0.25)" strokeWidth="2" />
              <circle cx="20" cy="20" r="18" fill="none" stroke="hsl(var(--primary-foreground))" strokeWidth="2" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 18} strokeDashoffset={2 * Math.PI * 18 * (1 - progress)}
                className="transition-[stroke-dashoffset] duration-100 ease-linear" />
            </svg>
            {isPaused ? <Play className="w-4 h-4 relative z-10" /> : <Pause className="w-4 h-4 relative z-10" />}
          </button>
          <button onClick={prev} className="w-10 h-10 rounded-full border border-primary-foreground/40 flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/10 transition-colors" aria-label="Previous slide">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={next} className="w-10 h-10 rounded-full border border-primary-foreground/40 flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/10 transition-colors" aria-label="Next slide">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
