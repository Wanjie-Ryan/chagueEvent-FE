import { useMusicPlayer } from "@/context/MusicPlayerContext";
import { resolveImage } from "@/lib/imageMap";
import { Play, Pause, Music } from "lucide-react";
import type { Track } from "@/hooks/useArtists";

type Props = {
  track: Track & { artistName?: string };
  index: number;
  queue?: (Track & { artistName?: string })[];
};

const formatDuration = (s: number) => {
  if (!s) return "--:--";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

const TrackRow = ({ track, index, queue }: Props) => {
  const { currentTrack, isPlaying, play, pause, resume } = useMusicPlayer();
  const isActive = currentTrack?.id === track.id;

  const handlePlay = () => {
    if (isActive && isPlaying) {
      pause();
    } else if (isActive) {
      resume();
    } else {
      play(track, queue || [track]);
    }
  };

  return (
    <button
      onClick={handlePlay}
      className={`w-full flex items-center gap-4 px-4 py-3 transition-colors text-left group ${
        isActive ? "bg-secondary" : "hover:bg-secondary/50"
      }`}
    >
      {/* Index / Play icon */}
      <div className="w-8 text-center flex-shrink-0">
        {isActive && isPlaying ? (
          <Pause size={14} className="text-foreground mx-auto" />
        ) : (
          <span className="font-body text-sm text-muted-foreground group-hover:hidden">{index + 1}</span>
        )}
        <Play size={14} className="text-foreground mx-auto hidden group-hover:block" />
      </div>

      {/* Cover */}
      <div className="w-10 h-10 bg-secondary flex-shrink-0 overflow-hidden">
        {track.cover_url ? (
          <img src={resolveImage(track.cover_url)} alt={track.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Music size={14} className="text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`font-body text-sm truncate ${isActive ? "font-medium text-foreground" : "text-foreground"}`}>
          {track.title}
        </p>
        {track.artistName && (
          <p className="font-body text-xs text-muted-foreground truncate">{track.artistName}</p>
        )}
      </div>

      {/* Genre */}
      {track.genre && (
        <span className="hidden md:block font-body text-xs text-muted-foreground">{track.genre}</span>
      )}

      {/* Duration */}
      <span className="font-body text-xs text-muted-foreground w-12 text-right">
        {formatDuration(track.duration_seconds)}
      </span>
    </button>
  );
};

export default TrackRow;
