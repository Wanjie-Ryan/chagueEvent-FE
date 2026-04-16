import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { resolveImage } from "@/lib/imageMap";
import { isNewProduct } from "@/lib/isNew";

const accessoryCategories = [
  "Glasses",
  "Sandals & Slides",
  "Watches",
  "Necklaces",
  "Bracelets",
  "Belts",
  "Hats",
  "Bags",
];

// Deterministic daily shuffle
const shuffleWithSeed = <T,>(arr: T[], seed: number): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    seed = (seed * 16807 + 0) % 2147483647;
    const j = seed % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const GlassesSection = () => {
  const { data: products = [] } = useProducts();
  const { addItem } = useCart();
  const [activeTab, setActiveTab] = useState("All");

  const accessories = useMemo(
    () => products.filter((p) =>
      accessoryCategories.some(
        (cat) => p.category.toLowerCase() === cat.toLowerCase()
      )
    ),
    [products]
  );

  const filtered = useMemo(() => {
    const today = new Date();
    const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    const pool = activeTab === "All"
      ? accessories
      : accessories.filter((p) => p.category.toLowerCase() === activeTab.toLowerCase());
    return shuffleWithSeed(pool, seed).slice(0, 8);
  }, [accessories, activeTab]);

  return (
    <section className="mx-auto max-w-[1920px] px-6 lg:px-12 py-16">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
            Accessories
          </h2>
          <p className="font-body text-sm text-muted-foreground mt-1">
            Premium eyewear, sandals, watches & more from top brands
          </p>
        </div>
        <Link
          to="/products"
          className="font-body text-sm font-medium text-foreground underline underline-offset-4 hover:text-muted-foreground transition-colors"
        >
          View All
        </Link>
      </div>

      {/* Sub-category tabs */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {["All", ...accessoryCategories].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-4 py-1.5 font-body text-xs font-medium border transition-colors ${
              activeTab === cat
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-foreground border-border hover:border-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="font-body text-sm text-muted-foreground py-8 text-center">
          No {activeTab.toLowerCase()} available yet — coming soon!
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {filtered.map((product) => (
            <div key={product.id} className="group cursor-pointer">
              <Link to={`/product/${product.id}`}>
                <div className="relative aspect-square bg-secondary overflow-hidden mb-3">
                  {isNewProduct(product.created_at) && (
                    <span className="absolute top-2 left-2 z-10 bg-foreground text-background font-body text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5">
                      New
                    </span>
                  )}
                  <img
                    src={resolveImage(product.image_url)}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <h3 className="font-body text-sm font-medium text-foreground">{product.name}</h3>
                <p className="font-body text-xs text-muted-foreground">{product.subtitle}</p>
                <p className="font-body text-sm font-semibold text-foreground mt-1">
                  KSH {product.price.toLocaleString()}
                </p>
              </Link>
              <button
                onClick={() =>
                  addItem({
                    id: product.id,
                    name: product.name,
                    subtitle: product.subtitle,
                    price: product.price,
                    image: resolveImage(product.image_url),
                  })
                }
                className="mt-2 border border-foreground text-foreground px-4 py-1.5 font-body text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                Add to Bag
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default GlassesSection;
