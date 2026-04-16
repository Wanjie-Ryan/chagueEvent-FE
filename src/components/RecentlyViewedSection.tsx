import { Link } from "react-router-dom";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { resolveImage } from "@/lib/imageMap";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

const RecentlyViewedSection = () => {
  const { viewedIds } = useRecentlyViewed();
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: products = [] } = useQuery({
    queryKey: ["recently-viewed", viewedIds],
    queryFn: async () => {
      if (viewedIds.length === 0) return [];
      const { data } = await supabase
        .from("products")
        .select("id, name, subtitle, price, image_url")
        .in("id", viewedIds);
      if (!data) return [];
      // Preserve viewing order
      return viewedIds
        .map((id) => data.find((p) => p.id === id))
        .filter(Boolean) as typeof data;
    },
    enabled: viewedIds.length > 0,
  });

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -280 : 280,
      behavior: "smooth",
    });
  };

  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1920px] px-6 lg:px-12 py-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground uppercase tracking-tight">
          Recently Viewed
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 border border-border hover:bg-secondary transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 border border-border hover:bg-secondary transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth"
      >
        {products.map((product) => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            className="group flex-shrink-0 w-[200px] md:w-[260px]"
          >
            <div className="overflow-hidden bg-secondary aspect-square mb-3">
              <img
                src={resolveImage(product.image_url)}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <h3 className="font-display text-sm font-bold text-foreground uppercase tracking-tight group-hover:underline line-clamp-1">
              {product.name}
            </h3>
            <p className="font-body text-xs text-muted-foreground line-clamp-1">
              {product.subtitle}
            </p>
            <p className="font-display text-sm font-semibold text-foreground mt-1">
              KSh {product.price.toLocaleString()}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewedSection;
