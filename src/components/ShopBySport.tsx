import { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import sportRunning from "@/assets/sport-running-new.jpg";
import sportFootball from "@/assets/sport-football-new.jpg";
import sportBasketball from "@/assets/sport-basketball-new.jpg";
import sportGym from "@/assets/sport-gym-new.jpg";
import sportTennis from "@/assets/sport-tennis.jpg";
import sportYoga from "@/assets/sport-yoga.jpg";
import sportSkateboard from "@/assets/sport-skateboard.jpg";
import sportGolf from "@/assets/sport-golf.jpg";

const sports = [
  { name: "Running", image: sportRunning },
  { name: "Football", image: sportFootball },
  { name: "Basketball", image: sportBasketball },
  { name: "Gym & Training", image: sportGym },
  { name: "Tennis", image: sportTennis },
  { name: "Yoga", image: sportYoga },
  { name: "Skateboarding", image: sportSkateboard },
  { name: "Golf", image: sportGolf },
];

const ShopBySport = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === "left" ? -260 : 260, behavior: "smooth" });
    }
  };

  return (
    <section className="mx-auto max-w-[1920px] px-6 lg:px-12 py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground">Shop by Sport</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => scroll("left")}
            className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
      >
        {sports.map((sport) => (
          <Link
            key={sport.name}
            to="/products"
            className="flex-shrink-0 group"
            style={{ width: 280 }}
          >
            <div className="overflow-hidden rounded-sm mb-2" style={{ height: 280 }}>
              <img
                src={sport.image}
                alt={sport.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <h3 className="font-display text-sm md:text-base font-semibold text-foreground">{sport.name}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default ShopBySport;
