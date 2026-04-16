import { useMusicPlayer } from "@/context/MusicPlayerContext";
import { useFeaturedTracks, useArtists } from "@/hooks/useArtists";
import { Play, Pause } from "lucide-react";
import { resolveImage } from "@/lib/imageMap";

const Equalizer = ({ active }: { active: boolean }) => (
  <div className="flex items-end gap-[2px] h-4">
    {[0.6, 1, 0.4, 0.8, 0.5].map((h, i) => (
      <div
        key={i}
        className={`w-[3px] bg-primary-foreground/80 rounded-full transition-all ${active ? "animate-pulse" : ""}`}
        style={{
          height: active ? `${h * 100}%` : "20%",
          animationDelay: `${i * 120}ms`,
          animationDuration: `${600 + i * 100}ms`,
        }}
      />
    ))}
  </div>
);

const NowPlayingWidget = () => {
  const { currentTrack, isPlaying, pause, resume, play } = useMusicPlayer();
  const { data: tracks = [] } = useFeaturedTracks();
  const { data: artists = [] } = useArtists();

  const displayTrack = currentTrack || tracks[0];
  if (!displayTrack) return null;

  const artist = artists.find((a) => a.id === displayTrack.artist_id);
  const trackWithArtist = { ...displayTrack, artistName: artist?.name || "" };

  const handlePlay = () => {
    if (currentTrack?.id === displayTrack.id) {
      if (isPlaying) pause(); else resume();
    } else {
      play(trackWithArtist, tracks.map((t) => ({
        ...t,
        artistName: artists.find((a) => a.id === t.artist_id)?.name || "",
      })));
    }
  };

  const isActive = currentTrack?.id === displayTrack.id;

  return (
    <div className="flex items-center gap-3 bg-foreground/30 backdrop-blur-md border border-primary-foreground/20 px-4 py-2.5 rounded-full max-w-xs">
      {/* Cover */}
      <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border border-primary-foreground/30">
        {displayTrack.cover_url ? (
          <img src={resolveImage(displayTrack.cover_url)} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-primary-foreground/20" />
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="font-body text-xs font-medium text-primary-foreground truncate">{displayTrack.title}</p>
        <p className="font-body text-[10px] text-primary-foreground/60 truncate">{artist?.name || "Style n Tunes"}</p>
      </div>

      {/* Equalizer */}
      <Equalizer active={isActive && isPlaying} />

      {/* Play button */}
      <button
        onClick={handlePlay}
        className="w-8 h-8 rounded-full bg-primary-foreground text-primary flex items-center justify-center hover:opacity-90 transition-opacity flex-shrink-0"
      >
        {isActive && isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
      </button>
    </div>
  );
};

export default NowPlayingWidget;
