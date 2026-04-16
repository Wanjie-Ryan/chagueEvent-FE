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

const CATEGORY_ORDER = ["All", "Sneakers", "Football Boots", "Boots", "Clogs", "Loafers", "Slides", "Clothing", "Watches", "Accessories"];

const ITEMS_PER_PAGE = 24;

const Products = () => {
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get("category") || "";

  useSEO({
    title: categoryFromUrl ? `${categoryFromUrl} — Shop Style n Tunes` : "Shop All Products | Style n Tunes",
    description: categoryFromUrl
      ? `Browse ${categoryFromUrl.toLowerCase()} at Style n Tunes. Bold streetwear, free delivery across Kenya.`
      : "Browse sneakers, boots, clothing, watches & more at Style n Tunes. Free delivery across Kenya.",
    canonical: `https://stylentunes.com/products${categoryFromUrl ? `?category=${categoryFromUrl}` : ""}`,
  });

  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const { addItem } = useCart();
  const { data: allProducts = [], isLoading } = useProducts();

  // Compute global min/max price
  const [globalMin, globalMax] = useMemo(() => {
    if (allProducts.length === 0) return [0, 100000];
    const prices = allProducts.map((p) => p.price);
    return [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))];
  }, [allProducts]);

  // Init price range once products load
  useEffect(() => {
    if (allProducts.length > 0) {
      setPriceRange([globalMin, globalMax]);
    }
  }, [globalMin, globalMax, allProducts.length]);

  const suggestions = useMemo(
    () => searchQuery.length > 0
      ? allProducts.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 6)
      : [],
    [allProducts, searchQuery]
  );

  useEffect(() => {
    if (categoryFromUrl) {
      setActiveCategory(categoryFromUrl);
      setSearchQuery("");
    }
  }, [categoryFromUrl]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery, sortBy, priceRange]);

  const searchFiltered = searchQuery
    ? allProducts.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : allProducts;

  const existingCats = new Set(searchFiltered.map((p) => p.category));
  const categories = CATEGORY_ORDER.filter((c) => c === "All" || existingCats.has(c));
  existingCats.forEach((c) => { if (!categories.includes(c)) categories.push(c); });

  const filtered = useMemo(() => {
    let items = activeCategory === "All" ? searchFiltered : searchFiltered.filter((p) => p.category === activeCategory);
    items = items.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    return items;
  }, [searchFiltered, activeCategory, priceRange]);

  const sortedProducts = useMemo(() => {
    let items = activeCategory === "All" && sortBy === "default" ? shuffleArray(filtered) : [...filtered];
    if (sortBy === "price-asc") items.sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") items.sort((a, b) => b.price - a.price);
    else if (sortBy === "newest") items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    else if (sortBy === "name-asc") items.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "name-desc") items.sort((a, b) => b.name.localeCompare(a.name));
    return items;
  }, [filtered, activeCategory, sortBy]);

  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = sortedProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
              onFocus={() => searchQuery.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              className="w-full pl-10 pr-4 py-2.5 border border-border bg-background text-foreground font-body text-sm focus:outline-none focus:border-foreground transition-colors"
            />
            {showSuggestions && searchQuery.length > 0 && (
              <div className="absolute z-50 top-full left-0 w-full bg-background border border-border shadow-lg max-h-64 overflow-y-auto">
                {suggestions.length === 0 ? (
                  <p className="px-4 py-3 font-body text-sm text-muted-foreground">No results found</p>
                ) : (
                  suggestions.map((p) => (
                    <Link key={p.id} to={`/product/${p.id}`} className="flex items-center gap-3 px-4 py-2 hover:bg-secondary transition-colors">
                      <img src={resolveImage(p.image_url)} alt={p.name} className="w-10 h-10 object-cover bg-secondary" />
                      <div>
                        <p className="font-body text-sm text-foreground">{p.name}</p>
                        <p className="font-body text-xs text-muted-foreground">KSH {p.price.toLocaleString()}</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}
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
            {sortedProducts.length} {sortedProducts.length === 1 ? "item" : "items"}
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
        ) : sortedProducts.length === 0 ? (
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
                    <p className="font-body text-sm font-semibold text-foreground mt-1">KSH {product.price.toLocaleString()}</p>
                  </Link>
                  <button
                    onClick={() => addItem({ id: product.id, name: product.name, subtitle: product.subtitle, price: product.price, image: resolveImage(product.image_url) })}
                    className="mt-2 border border-foreground text-foreground px-4 py-1.5 font-body text-xs font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    Add to Bag
                  </button>
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
