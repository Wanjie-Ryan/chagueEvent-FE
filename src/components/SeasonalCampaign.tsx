import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Play, Pause } from "lucide-react";

const SeasonalCampaign = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => { });
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative h-[60vh] md:h-[70vh]">
        <video
          ref={videoRef}
          src="/videos/seasonal-banner.mp4"
          muted
          loop
          autoPlay
          playsInline
          preload="metadata"
          className="h-full w-full object-cover"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 text-center px-4">
          <p className="font-body text-xs tracking-[0.3em] text-primary-foreground/70 uppercase mb-3">
            Limited Edition Drop
          </p>
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-3 leading-none">
            SEASONAL VIBES
          </h2>
          <p className="font-body text-sm md:text-base text-primary-foreground/70 mb-8 max-w-md">
            Exclusive pieces for the season. Fresh drops, bold aesthetics, timeless style.
          </p>
          <Link
            to="/products"
            className="bg-primary-foreground text-primary px-8 py-3 rounded-full font-body text-sm font-medium hover:bg-primary-foreground/90 transition-colors"
          >
            Customize Your Collection
          </Link>
        </div>

        {/* Play/Pause */}
        <button
          onClick={togglePlay}
          className="absolute bottom-6 right-6 w-10 h-10 rounded-full border border-primary-foreground/40 flex items-center justify-center text-primary-foreground hover:bg-primary-foreground/10 transition-colors z-20"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
      </div>
    </section>
  );
};

export default SeasonalCampaign;
