import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";

const NewArrivals = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Use products hook sorted by newest items
  const { data: serverProducts = [], isLoading } = useProducts({ sort: "newest" });
  const products = serverProducts.slice(0, 8); // Take top 8 latest

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
    }
  };

  return (
    <section className="mx-auto max-w-[1920px] px-6 lg:px-12 py-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="font-display text-3xl font-semibold text-foreground">Fresh Talent</h2>
          <p className="font-body text-sm text-muted-foreground mt-1 max-w-md">
            Get the newest service providers listed right here. Verified and ready to make your event spectacular!
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/products?sort=newest" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors mr-2 whitespace-nowrap">
            View All
          </Link>
          <button onClick={() => scroll("left")} className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors flex-shrink-0">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => scroll("right")} className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors flex-shrink-0">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
        </div>
      ) : products.length === 0 ? (
        <div className="py-12 text-center">
            <p className="font-body text-muted-foreground">No new providers available at the moment.</p>
        </div>
      ) : (
        <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
          {products.map((product) => {
            const hasImage = product.image_url && product.image_url !== "default-avatar.png";
            
            return (
            <div key={product.id} className="w-[220px] md:w-[260px] flex-shrink-0 group cursor-pointer">
              <Link to={`/product/${product.id}`} className="block h-full">
                <div className="h-[200px] bg-secondary overflow-hidden mb-3 border border-border">
                  {hasImage ? (
                    <img
                      src={product.image_url.startsWith("http") ? product.image_url : `http://localhost:3005${product.image_url}`}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted transition-transform duration-500 group-hover:scale-105">
                       <span className="text-6xl text-muted-foreground/30 font-display font-bold uppercase">
                         {product.name.charAt(0)}
                       </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-between">
                  <div>
                    <h3 className="font-body text-sm font-medium text-foreground line-clamp-1">{product.name}</h3>
                    <p className="font-body text-xs text-muted-foreground mt-0.5 line-clamp-1">{product.subtitle}</p>
                    {product.description && (
                      <p className="font-body text-xs text-muted-foreground mt-1.5 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>
                  <p className="font-body text-sm font-semibold text-foreground mt-3">From KSH {product.price?.toLocaleString()}</p>
                </div>
              </Link>
            </div>
          )})}
        </div>
      )}
    </section>
  );
};

export default NewArrivals;
