import { Link } from "react-router-dom";
import { resolveImage } from "@/lib/imageMap";
import CountdownTimer from "./CountdownTimer";
import type { Drop } from "@/hooks/useDrops";
import { Bell } from "lucide-react";

type Props = {
  drop: Drop;
};

const DropCard = ({ drop }: Props) => {
  const isLive = new Date(drop.drop_date).getTime() <= Date.now();
  const isComingSoon = drop.status === "coming_soon" && !isLive;
  const isSoldOut = drop.status === "sold_out";

  return (
    <Link to={`/drops/${drop.id}`} className="group block">
      <div className="relative aspect-[4/5] bg-secondary overflow-hidden">
        {drop.image_url && (
          <img
            src={resolveImage(drop.image_url)}
            alt={drop.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />

        {/* Status badge */}
        <div className="absolute top-3 left-3">
          {isComingSoon && (
            <span className="bg-foreground text-background font-body text-[10px] font-semibold uppercase tracking-wider px-3 py-1">
              Coming Soon
            </span>
          )}
          {isLive && !isSoldOut && (
            <span className="bg-destructive text-destructive-foreground font-body text-[10px] font-semibold uppercase tracking-wider px-3 py-1 animate-pulse">
              Live Now
            </span>
          )}
          {isSoldOut && (
            <span className="bg-muted-foreground text-background font-body text-[10px] font-semibold uppercase tracking-wider px-3 py-1">
              Sold Out
            </span>
          )}
        </div>

        {/* Limited quantity badge */}
        {drop.max_quantity && !isSoldOut && (
          <div className="absolute top-3 right-3">
            <span className="bg-background text-foreground font-body text-[10px] font-semibold px-2 py-1">
              {drop.max_quantity} pcs
            </span>
          </div>
        )}

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-display text-lg font-bold text-background leading-tight">
            {drop.name}
          </h3>
          {isComingSoon && (
            <div className="mt-3">
              <CountdownTimer targetDate={drop.drop_date} variant="compact" />
            </div>
          )}
          {isComingSoon && (
            <div className="mt-3 flex items-center gap-1.5 font-body text-xs text-background/80">
              <Bell size={12} /> Get notified
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default DropCard;
