import { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Music, Play } from "lucide-react";
import { useFeaturedTracks, useArtists } from "@/hooks/useArtists";
import { useProducts } from "@/hooks/useProducts";
import { useMusicPlayer } from "@/context/MusicPlayerContext";
import { resolveImage } from "@/lib/imageMap";

const vibeData = {
  title: "Late Night Nairobi",
  subtitle: "Amapiano & Chill",
  description: "Smooth beats for the late-night grind. Check out your favorite Event master.",
};

const ThisWeeksVibe = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { data: tracks = [] } = useFeaturedTracks();
  const { data: artists = [] } = useArtists();
  const { data: products = [] } = useProducts();
  const { play, currentTrack, isPlaying, pause, resume } = useMusicPlayer();
  

  const vibeProducts = products.slice(0, 6);
  const displayTracks = tracks.slice(0, 4);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });
  };

  return (
    <section className="mx-auto max-w-[1920px] px-6 lg:px-12 py-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <p className="font-body text-xs tracking-[0.3em] text-muted-foreground uppercase mb-2">This Week's Vibe</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground uppercase tracking-tight">
            {vibeData.title}
          </h2>
          <p className="font-body text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <Music size={14} /> {vibeData.subtitle} — {vibeData.description}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => scroll("left")} className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => scroll("right")} className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Tracks mini-player */}
      {displayTracks.length > 0 && (
        <div className="flex gap-3 mb-8 overflow-x-auto scrollbar-hide pb-2">
          {displayTracks.map((track) => {
            const artist = artists.find((a) => a.id === track.artist_id);
            const isActive = currentTrack?.id === track.id;
            return (
              <button
                key={track.id}
                onClick={() => {
                  if (isActive) { if (isPlaying) pause(); else resume(); }
                  else {
                    play({ ...track, artistName: artist?.name || "" }, displayTracks.map((t) => ({
                      ...t, artistName: artists.find((a) => a.id === t.artist_id)?.name || "",
                    })));
                  }
                }}
                className={`flex items-center gap-3 flex-shrink-0 px-4 py-3 border transition-colors ${
                  isActive ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"
                }`}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  {track.cover_url ? (
                    <img src={resolveImage(track.cover_url)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-secondary flex items-center justify-center"><Music size={12} /></div>
                  )}
                </div>
                <div className="text-left min-w-0">
                  <p className="font-body text-xs font-medium truncate">{track.title}</p>
                  <p className={`font-body text-[10px] truncate ${isActive ? "text-background/60" : "text-muted-foreground"}`}>{artist?.name}</p>
                </div>
                {isActive && isPlaying ? (
                  <div className="flex items-end gap-[2px] h-3 ml-2">
                    {[0.6, 1, 0.4].map((h, i) => (
                      <div key={i} className="w-[2px] bg-current rounded-full animate-pulse" style={{ height: `${h * 100}%`, animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                ) : (
                  <Play size={12} className="ml-2 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Products */}
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
        {vibeProducts.map((product) => (
          <div key={product.id} className="min-w-[220px] md:min-w-[260px] flex-shrink-0 group">
            <Link to={`/product/${product.id}`}>
              <div className="aspect-square bg-secondary overflow-hidden mb-3">
                <img
                  src={resolveImage(product.image_url)}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <h3 className="font-body text-sm font-medium text-foreground line-clamp-1">{product.name}</h3>
              <p className="font-body text-xs text-muted-foreground">{product.subtitle}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="font-body text-sm font-semibold text-foreground">KSH {product.price.toLocaleString()}</p>
                <span className="font-body text-[10px] text-muted-foreground">🎧 {vibeData.subtitle}</span>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ThisWeeksVibe;
