import { Link } from "react-router-dom";
import { useArtists, useFeaturedTracks } from "@/hooks/useArtists";
import { resolveImage } from "@/lib/imageMap";
import { Music, Play, ExternalLink } from "lucide-react";
import { useMusicPlayer } from "@/context/MusicPlayerContext";

const FeaturedArtist = () => {
  const { data: artists = [] } = useArtists();
  const { data: tracks = [] } = useFeaturedTracks();
  const { play, currentTrack, isPlaying, pause, resume } = useMusicPlayer();

  // Pick first artist as featured
  const artist = artists[0];
  if (!artist) return null;

  const artistTracks = tracks.filter((t) => t.artist_id === artist.id).slice(0, 3);

  return (
    <section className="mx-auto max-w-[1920px] px-6 lg:px-12 py-16">
      <p className="font-body text-xs tracking-[0.3em] text-muted-foreground uppercase mb-2">Featured Artist</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
        {/* Image */}
        <div className="relative aspect-[4/5] bg-secondary overflow-hidden">
          {artist.image_url ? (
            <img src={resolveImage(artist.image_url)} alt={artist.name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><Music size={48} className="text-muted-foreground" /></div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <h3 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground uppercase tracking-tight">{artist.name}</h3>
            {artist.genre && <p className="font-body text-sm text-primary-foreground/70 mt-1">{artist.genre}</p>}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center">
          <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6 line-clamp-4">
            {artist.bio || "Discover the sounds and style behind this creative force."}
          </p>

          {/* Tracks */}
          {artistTracks.length > 0 && (
            <div className="space-y-2 mb-6">
              <p className="font-body text-xs uppercase tracking-widest text-muted-foreground mb-2">Top Tracks</p>
              {artistTracks.map((track) => {
                const isActive = currentTrack?.id === track.id;
                return (
                  <button
                    key={track.id}
                    onClick={() => {
                      if (isActive) { if (isPlaying) pause(); else resume(); }
                      else { play({ ...track, artistName: artist.name }, artistTracks.map((t) => ({ ...t, artistName: artist.name }))); }
                    }}
                    className={`w-full flex items-center gap-3 p-3 border transition-colors text-left ${
                      isActive ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"
                    }`}
                  >
                    <div className="w-10 h-10 flex-shrink-0 overflow-hidden">
                      {track.cover_url ? (
                        <img src={resolveImage(track.cover_url)} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-secondary flex items-center justify-center"><Music size={14} /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm font-medium truncate">{track.title}</p>
                      <p className={`font-body text-[10px] ${isActive ? "text-background/60" : "text-muted-foreground"}`}>{artist.name}</p>
                    </div>
                    {isActive && isPlaying ? (
                      <div className="flex items-end gap-[2px] h-3">
                        {[0.6, 1, 0.4].map((h, i) => (
                          <div key={i} className="w-[2px] bg-current rounded-full animate-pulse" style={{ height: `${h * 100}%`, animationDelay: `${i * 150}ms` }} />
                        ))}
                      </div>
                    ) : (
                      <Play size={14} className="flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex gap-3">
            <Link to={`/artists/${artist.slug}`} className="bg-foreground text-background px-6 py-3 font-body text-sm font-medium hover:opacity-80 transition-opacity">
              View Profile
            </Link>
            {artist.social_spotify && (
              <a href={artist.social_spotify} target="_blank" rel="noopener noreferrer" className="border border-border px-6 py-3 font-body text-sm font-medium text-foreground hover:border-foreground transition-colors flex items-center gap-2">
                <ExternalLink size={14} /> Spotify
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedArtist;
