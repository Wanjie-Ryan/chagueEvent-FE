import { useState, useEffect, useMemo } from "react";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";
import { resolveImage } from "@/lib/imageMap";
import { isNewProduct } from "@/lib/isNew";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartSidebar from "@/components/CartSidebar";
import useSEO from "@/hooks/useSEO";

type SortOption = "default" | "price-asc" | "price-desc" | "newest" | "name-asc" | "name-desc";

const shuffleArray = <T,>(arr: T[]): T[] => {
  const seed = new Date().toDateString();
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    hash = (hash * 16807 + 0) % 2147483647;
    const j = Math.abs(hash) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const CATEGORY_ORDER = ["All", "Photography", "Catering", "Decor", "Entertainment", "Venue", "Other"];

const ITEMS_PER_PAGE = 24;

const Products = () => {
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get("category");

  useSEO({
    title: categoryFromUrl ? `${categoryFromUrl} — Service Directory` : "All Services | Chagua Event",
    description: "Browse all event service providers, from photography to catering.",
    canonical: `https://chaguaevent.com/products${categoryFromUrl ? `?category=${categoryFromUrl}` : ""}`,
  });

  const [activeCategory, setActiveCategory] = useState(
    categoryFromUrl ? categoryFromUrl.charAt(0).toUpperCase() + categoryFromUrl.slice(1) : "All"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  
  const globalMin = 0;
  const globalMax = 100000;
  const [priceRange, setPriceRange] = useState<[number, number]>([globalMin, globalMax]);
  const [debouncedPriceRange, setDebouncedPriceRange] = useState<[number, number]>([globalMin, globalMax]);
  
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { addItem } = useCart();

  // Debounce search query to prevent aggressive API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Debounce price range to prevent rate limiting backend when sliding
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedPriceRange(priceRange);
    }, 500);
    return () => clearTimeout(handler);
  }, [priceRange]);

  useEffect(() => {
    if (categoryFromUrl) {
      setActiveCategory(categoryFromUrl.charAt(0).toUpperCase() + categoryFromUrl.slice(1));
    }
  }, [categoryFromUrl]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, debouncedSearch, sortBy, debouncedPriceRange]);

  const { data: serverProducts = [], isLoading } = useProducts({
    category: activeCategory,
    search: debouncedSearch,
    minPrice: debouncedPriceRange[0] !== globalMin ? debouncedPriceRange[0] : undefined,
    maxPrice: debouncedPriceRange[1] !== globalMax ? debouncedPriceRange[1] : undefined,
    sort: sortBy
  });

  const categories = CATEGORY_ORDER;

  const totalPages = Math.ceil(serverProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = serverProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const activeFilterCount = (activeCategory !== "All" ? 1 : 0) + (priceRange[0] > globalMin || priceRange[1] < globalMax ? 1 : 0);

  const clearAllFilters = () => {
    setActiveCategory("All");
    setPriceRange([globalMin, globalMax]);
    setSearchQuery("");
    setSortBy("default");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartSidebar />
      <main className="mx-auto max-w-[1920px] px-6 lg:px-12 py-12">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">All Service Providers</h1>
        <p className="font-body text-sm text-muted-foreground mb-8">
          Find your perfect event service provider.
        </p>

        {/* Search + Controls Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search service providers..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setActiveCategory("All"); }}
              className="w-full pl-10 pr-4 py-2.5 border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:border-foreground transition-colors"
            />
          </div>

          {/* Filter toggle + Sort */}
          <div className="flex gap-3 items-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 border font-body text-sm font-medium transition-colors ${
                showFilters ? "bg-primary text-primary-foreground border-primary" : "bg-background text-foreground border-border hover:border-foreground"
              }`}
            >
              <SlidersHorizontal size={14} />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1 bg-foreground text-background text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3 py-2.5 border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:border-foreground transition-colors"
            >
              <option value="default">Sort by</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="newest">Newest</option>
              <option value="name-asc">Name: A → Z</option>
              <option value="name-desc">Name: Z → A</option>
            </select>
          </div>
        </div>

        {/* Active Filters Summary */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="font-body text-xs text-muted-foreground">Active filters:</span>
            {activeCategory !== "All" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-foreground font-body text-xs border border-border">
                {activeCategory}
                <button onClick={() => setActiveCategory("All")} className="hover:text-destructive"><X size={12} /></button>
              </span>
            )}
            {(priceRange[0] > globalMin || priceRange[1] < globalMax) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary text-foreground font-body text-xs border border-border">
                KSH {priceRange[0].toLocaleString()} – {priceRange[1].toLocaleString()}
                <button onClick={() => setPriceRange([globalMin, globalMax])} className="hover:text-destructive"><X size={12} /></button>
              </span>
            )}
            <button onClick={clearAllFilters} className="font-body text-xs text-muted-foreground underline hover:text-foreground">
              Clear all
            </button>
          </div>
        )}

        {/* Filter Panel */}
        {showFilters && (
          <div className="border border-border bg-background p-6 mb-8 animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Categories */}
              <div>
                <h3 className="font-display text-sm font-bold text-foreground uppercase tracking-wider mb-3">Category</h3>
                <div className="flex gap-2 flex-wrap">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-4 py-1.5 font-body text-xs font-medium border transition-colors ${
                        activeCategory === cat
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-border hover:border-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-display text-sm font-bold text-foreground uppercase tracking-wider mb-3">Price Range</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <label className="font-body text-[10px] text-muted-foreground uppercase">Min</label>
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([Math.max(globalMin, Number(e.target.value)), priceRange[1]])}
                        min={globalMin}
                        max={priceRange[1]}
                        className="w-full px-3 py-2 border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:border-foreground"
                      />
                    </div>
                    <span className="text-muted-foreground font-body text-sm mt-4">—</span>
                    <div className="flex-1">
                      <label className="font-body text-[10px] text-muted-foreground uppercase">Max</label>
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Math.min(globalMax, Number(e.target.value))])}
                        min={priceRange[0]}
                        max={globalMax}
                        className="w-full px-3 py-2 border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:border-foreground"
                      />
                    </div>
                  </div>
                  {/* Range slider */}
                  <input
                    type="range"
                    min={globalMin}
                    max={globalMax}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full accent-primary"
                  />
                  <p className="font-body text-xs text-muted-foreground">
                    KSH {priceRange[0].toLocaleString()} — KSH {priceRange[1].toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="font-body text-sm text-muted-foreground">
            {serverProducts.length} {serverProducts.length === 1 ? "item" : "items"}
            {totalPages > 1 && ` · Page ${currentPage} of ${totalPages}`}
          </p>
        </div>

        {/* Category pills (always visible, compact) */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 font-body text-xs font-medium border transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-foreground border-border hover:border-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
          </div>
        ) : serverProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-body text-lg text-muted-foreground mb-4">No providers match your filters</p>
            <button onClick={clearAllFilters} className="px-6 py-2 border border-foreground text-foreground font-body text-sm hover:bg-primary hover:text-primary-foreground transition-colors">
              Clear all filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {paginatedProducts.map((product) => (
                <div key={product.id} className="group cursor-pointer">
                  <Link to={`/product/${product.id}`} className="block h-full">
                    <div className="relative aspect-square bg-secondary overflow-hidden mb-3 border border-border">
                      {isNewProduct(product.created_at) && (
                        <span className="absolute top-2 left-2 z-10 bg-foreground text-background font-body text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5">
                          New
                        </span>
                      )}
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted transition-transform duration-500 group-hover:scale-105">
                           <span className="text-4xl text-muted-foreground/30 font-display font-bold uppercase">
                             {product.name.charAt(0)}
                           </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col h-full">
                      <h3 className="font-body text-sm font-bold text-foreground line-clamp-1">{product.name}</h3>
                      <p className="font-body text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                        📍 {product.subtitle}
                      </p>
                      {product.description && (
                        <p className="font-body text-xs text-muted-foreground mt-2 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      <p className="font-body text-sm font-semibold text-foreground mt-3">From KSH {product.price?.toLocaleString()}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-border font-body text-sm hover:border-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let page: number;
                  if (totalPages <= 7) {
                    page = i + 1;
                  } else if (currentPage <= 4) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 3) {
                    page = totalPages - 6 + i;
                  } else {
                    page = currentPage - 3 + i;
                  }
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 font-body text-sm border transition-colors ${
                        currentPage === page
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border text-foreground hover:border-foreground"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-border font-body text-sm hover:border-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Products;
