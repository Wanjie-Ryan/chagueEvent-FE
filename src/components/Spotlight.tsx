import { Link } from "react-router-dom";

import spotlightJordan1Low from "@/assets/spotlight-jordan1-low.png";
import spotlightDunk from "@/assets/spotlight-dunk.png";
import spotlightAf1 from "@/assets/spotlight-af1.png";
import spotlightVomero from "@/assets/spotlight-vomero.png";
import spotlightPegasus from "@/assets/spotlight-pegasus.png";
import spotlight247 from "@/assets/spotlight-247-collection.png";
import spotlightTennis from "@/assets/spotlight-tennis-apparel.png";
import spotlightVaporfly from "@/assets/spotlight-vaporfly.png";
import spotlightSabrina from "@/assets/spotlight-sabrina.png";
import spotlightCortez from "@/assets/spotlight-cortez.png";
import spotlightMetcon from "@/assets/spotlight-metcon.png";
import spotlightNbaJerseys from "@/assets/spotlight-nba-jerseys.png";
import spotlightShox from "@/assets/spotlight-shox.png";
import spotlightAirMaxDn from "@/assets/spotlight-airmax-dn.png";
import spotlightZoomfly from "@/assets/spotlight-zoomfly.png";
import spotlightGraphicTees from "@/assets/spotlight-graphic-tees.png";

interface SpotlightItem {
  name: string;
  image: string;
  link: string;
}

const row1: SpotlightItem[] = [
  { name: "Air Jordan 1\nLow", image: spotlightJordan1Low, link: "/products?category=Sneakers" },
  { name: "Dunk", image: spotlightDunk, link: "/products?category=Sneakers" },
  { name: "Air Force 1", image: spotlightAf1, link: "/products?category=Sneakers" },
  { name: "Vomero Plus", image: spotlightVomero, link: "/products?category=Sneakers" },
  { name: "Pegasus\nPremium", image: spotlightPegasus, link: "/products?category=Sneakers" },
  { name: "24.7\nCollection", image: spotlight247, link: "/products" },
  { name: "Tennis\nApparel", image: spotlightTennis, link: "/products" },
  { name: "Vaporfly", image: spotlightVaporfly, link: "/products?category=Sneakers" },
];

const row2: SpotlightItem[] = [
  { name: "Sabrina", image: spotlightSabrina, link: "/products?category=Sneakers" },
  { name: "Cortez", image: spotlightCortez, link: "/products?category=Sneakers" },
  { name: "Metcon10", image: spotlightMetcon, link: "/products?category=Sneakers" },
  { name: "NBA Jerseys", image: spotlightNbaJerseys, link: "/products" },
  { name: "Shox", image: spotlightShox, link: "/products?category=Sneakers" },
  { name: "Air Max DN", image: spotlightAirMaxDn, link: "/products?category=Sneakers" },
  { name: "Zoomfly 6", image: spotlightZoomfly, link: "/products?category=Sneakers" },
  { name: "Graphic Tees", image: spotlightGraphicTees, link: "/products" },
];

const SpotlightRow = ({ items }: { items: SpotlightItem[] }) => (
  <div className="grid grid-cols-4 md:grid-cols-8 gap-x-6 gap-y-6 mb-10 last:mb-0">
    {items.map((item) => (
      <Link
        key={item.name}
        to={item.link}
        className="flex flex-col items-center group"
      >
        <div className="w-full aspect-square flex items-center justify-center mb-3">
          <img
            src={item.image}
            alt={item.name.replace("\n", " ")}
            className="w-full h-full object-contain"
            loading="lazy"
          />
        </div>
        <span className="font-body text-xs text-foreground group-hover:text-muted-foreground transition-colors text-center leading-tight whitespace-pre-line">
          {item.name}
        </span>
      </Link>
    ))}
  </div>
);

const Spotlight = () => {
  return (
    <section className="mx-auto max-w-[1400px] px-6 lg:px-12 py-20 text-center">
      <h2 className="font-display text-6xl md:text-7xl lg:text-8xl font-black text-foreground mb-2 tracking-tighter leading-none">
        SPOTLIGHT
      </h2>
      <p className="font-body text-sm text-muted-foreground mb-16 max-w-lg mx-auto">
        Classic silhouettes and cutting-edge innovation to build your game from the ground up.
      </p>

      <SpotlightRow items={row1} />
      <SpotlightRow items={row2} />
    </section>
  );
};

export default Spotlight;
