import { useMusicPlayer } from "@/context/MusicPlayerContext";
import { resolveImage } from "@/lib/imageMap";
import { Play, Pause, SkipBack, SkipForward, X, Volume2, Music } from "lucide-react";
import { useState } from "react";

const formatTime = (s: number) => {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

const MusicPlayer = () => {
  const {
    currentTrack, isPlaying, progress, duration,
    pause, resume, next, previous, seek, isPlayerVisible,
  } = useMusicPlayer();
  const [expanded, setExpanded] = useState(false);

  if (!isPlayerVisible || !currentTrack) return null;

  const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-foreground text-background border-t border-border shadow-2xl">
      {/* Progress bar - clickable */}
      <div
        className="h-1 bg-muted-foreground/30 cursor-pointer group"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          seek(pct * duration);
        }}
      >
        <div
          className="h-full bg-destructive transition-all duration-150"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="mx-auto max-w-[1920px] px-4 md:px-6 py-3 flex items-center gap-4">
        {/* Track info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-muted-foreground/20 flex-shrink-0 overflow-hidden">
            {currentTrack.cover_url ? (
              <img src={resolveImage(currentTrack.cover_url)} alt={currentTrack.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music size={16} className="text-background/50" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-body text-sm font-medium truncate">{currentTrack.title}</p>
            {currentTrack.artistName && (
              <p className="font-body text-xs text-background/60 truncate">{currentTrack.artistName}</p>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button onClick={previous} className="text-background/60 hover:text-background transition-colors hidden sm:block">
            <SkipBack size={18} />
          </button>
          <button
            onClick={isPlaying ? pause : resume}
            className="w-10 h-10 bg-background text-foreground rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
          </button>
          <button onClick={next} className="text-background/60 hover:text-background transition-colors hidden sm:block">
            <SkipForward size={18} />
          </button>
        </div>

        {/* Time */}
        <div className="hidden md:flex items-center gap-2 text-xs font-body text-background/60 min-w-[80px] justify-end">
          <span>{formatTime(progress)}</span>
          <span>/</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
