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

      {/* Products */}
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
        {vibeProducts.map((product) => {
          const hasImage = product.image_url && product.image_url !== "default-avatar.png";
          
          return (
          <div key={product.id} className="w-[200px] md:w-[240px] flex-shrink-0 group">
            <Link to={`/product/${product.id}`} className="block h-full">
              <div className="h-[180px] bg-secondary overflow-hidden mb-3 border border-border">
                {hasImage ? (
                  <img
                    src={product.image_url.startsWith("http") ? product.image_url : `http://localhost:3005${product.image_url}`}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted transition-transform duration-500 group-hover:scale-105">
                     <span className="text-6xl text-muted-foreground/30 font-display font-bold uppercase">
                       {product.name.charAt(0)}
                     </span>
                  </div>
                )}
              </div>
              <h3 className="font-body text-sm font-medium text-foreground line-clamp-1">{product.name}</h3>
              <p className="font-body text-xs text-muted-foreground">{product.subtitle}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="font-body text-sm font-semibold text-foreground">KSH {product.price?.toLocaleString()}</p>
                <span className="font-body text-[10px] text-muted-foreground">🎧 {vibeData.subtitle}</span>
              </div>
            </Link>
          </div>
        )})}
      </div>
    </section>
  );
};

export default ThisWeeksVibe;
