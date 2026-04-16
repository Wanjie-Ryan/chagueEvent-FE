import { useDrops } from "@/hooks/useDrops";
import DropCard from "./DropCard";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const UpcomingDropsBanner = () => {
  const { data: drops = [] } = useDrops();

  // Show upcoming and live drops only (not sold_out), limit to 4
  const visibleDrops = drops
    .filter((d) => d.status !== "sold_out")
    .sort((a, b) => new Date(a.drop_date).getTime() - new Date(b.drop_date).getTime())
    .slice(0, 4);

  if (visibleDrops.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1920px] px-6 lg:px-12 py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Limited Drops
          </h2>
          <p className="font-body text-sm text-muted-foreground mt-1">
            Don't miss out — limited quantities, once they're gone, they're gone.
          </p>
        </div>
        <Link
          to="/drops"
          className="hidden md:flex items-center gap-1 font-body text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
        >
          View All <ChevronRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {visibleDrops.map((drop) => (
          <DropCard key={drop.id} drop={drop} />
        ))}
      </div>

      <Link
        to="/drops"
        className="md:hidden flex items-center justify-center gap-1 mt-6 font-body text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
      >
        View All Drops <ChevronRight size={16} />
      </Link>
    </section>
  );
};

export default UpcomingDropsBanner;
