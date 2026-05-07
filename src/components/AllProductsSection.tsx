import { Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { ArrowRight } from "lucide-react";
import { resolveImage } from "@/lib/imageMap";
const AllProductsSection = () => {
  const { data: products = [], isLoading } = useProducts();
  const displayed = products.slice(0, 12);

  if (isLoading) {
    return (
      <section className="mx-auto max-w-[1920px] px-6 lg:px-12 py-16">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground uppercase tracking-tight mb-8">
          All Products
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-muted aspect-square mb-3" />
              <div className="h-4 bg-muted w-3/4 mb-2" />
              <div className="h-3 bg-muted w-1/2" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (displayed.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1920px] px-6 lg:px-12 py-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground uppercase tracking-tight">
          All Products
        </h2>
        <Link
          to="/products"
          className="flex items-center gap-1 font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          View All <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {displayed.map((product) => (
          <Link
            key={product.id}
            to={`/product/${product.id}`}
            className="group block"
          >
            <div className="overflow-hidden bg-secondary aspect-square mb-3">
              <img
                src={resolveImage(product.image_url)}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-sm font-bold text-foreground uppercase tracking-tight group-hover:underline line-clamp-1">
                {product.name}
              </h3>
              <p className="font-body text-xs text-muted-foreground line-clamp-1">
                {product.subtitle}
              </p>
              <p className="font-display text-sm font-semibold text-foreground">
                Ksh {product.price.toLocaleString()}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default AllProductsSection;
