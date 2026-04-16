import { Link } from "react-router-dom";
import { useArtists } from "@/hooks/useArtists";
import { resolveImage } from "@/lib/imageMap";
import ScrollReveal from "@/components/ScrollReveal";
import { Music } from "lucide-react";

const ArtistsSection = () => {
  const { data: artists = [], isLoading } = useArtists();

  if (isLoading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" /></div>;

  if (artists.length === 0) return (
    <div className="text-center py-20">
      <Music size={48} className="text-muted-foreground mx-auto mb-4" />
      <p className="font-display text-xl text-muted-foreground">No artists yet</p>
      <p className="font-body text-sm text-muted-foreground mt-2">Check back soon for artist profiles and music.</p>
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {artists.map((artist, i) => (
        <ScrollReveal key={artist.id} delay={i * 0.05}>
          <Link to={`/artists/${artist.slug}`} className="group block">
            <div className="relative aspect-square bg-secondary overflow-hidden mb-3">
              {artist.image_url ? (
                <img src={resolveImage(artist.image_url)} alt={artist.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted"><Music size={32} className="text-muted-foreground" /></div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <h3 className="font-display text-base font-bold text-foreground">{artist.name}</h3>
            {artist.genre && <p className="font-body text-xs text-muted-foreground mt-0.5">{artist.genre}</p>}
          </Link>
        </ScrollReveal>
      ))}
    </div>
  );
};

export default ArtistsSection;
