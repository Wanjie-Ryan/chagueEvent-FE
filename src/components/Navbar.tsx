import { Search, Heart, ShoppingBag, Menu, X, ChevronDown, User } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import logoImg from "@/assets/logo.png";

type MegaColumn = { heading: string; links: string[] };
type NavItem = { label: string; href: string; mega?: MegaColumn[] };

const defaultNavLinks: NavItem[] = [
  {
    label: "Men",
    href: "/products",
    mega: [
      { heading: "All Shoes", links: ["Lifestyle", "Running", "Basketball", "Jordan", "Training & Gym", "Football", "Sandals & Slides"] },
      { heading: "All Clothing", links: ["Tops & T-Shirts", "Hoodies & Sweatshirts", "Jackets", "Pants & Tights", "Shorts", "Jerseys", "Accessories"] },
      { heading: "Shop by Sport", links: ["Running", "Basketball", "Football", "Tennis", "Golf", "Training & Gym", "Skateboarding"] },
      { heading: "Shop by Brand", links: ["Nike Sportswear", "Jordan", "Nike Lab", "ACG", "Nike SB"] },
    ],
  },
  {
    label: "Women",
    href: "/products",
    mega: [
      { heading: "New & Featured", links: ["New Arrivals", "Best Sellers", "Latest Drops", "Shop All Sale"] },
      { heading: "Shoes", links: ["All Shoes", "Lifestyle", "Running", "Basketball", "Jordan", "Training & Gym", "Sandals & Slides"] },
      { heading: "Clothing", links: ["All Clothing", "Tops & T-Shirts", "Hoodies & Sweatshirts", "Leggings", "Sports Bras", "Pants", "Shorts", "Skirts & Dresses"] },
      { heading: "Accessories", links: ["Bags & Backpacks", "Hats & Headwear", "Socks", "Sunglasses"] },
    ],
  },
  {
    label: "Kids",
    href: "/products",
    mega: [
      { heading: "New & Featured", links: ["New Arrivals", "Best Sellers", "Shop All Sale"] },
      { heading: "All Shoes", links: ["Big Kids (7-15 yrs)", "Little Kids (3-7 yrs)", "Baby & Toddler (0-3 yrs)", "Basketball", "Jordan", "Lifestyle", "Running"] },
      { heading: "All Clothing", links: ["Big Kids (7-15 yrs)", "Little Kids (3-7 yrs)", "Baby & Toddler (0-3 yrs)", "Hoodies & Sweatshirts", "Pants", "Shorts", "Tops & Graphic Tees"] },
      { heading: "Accessories", links: ["Bags & Backpacks", "Hats & Headwear", "Socks", "Sunglasses"] },
    ],
  },
  {
    label: "Jordan",
    href: "/products",
    mega: [
      { heading: "New & Featured", links: ["New Arrivals", "Best Sellers", "Jordan Heat Check", "Infrared Collection", "Shop All Sale"] },
      { heading: "Men", links: ["Shop All", "Shoes", "AJ1", "Clothing"] },
      { heading: "Women", links: ["Shop All", "Shoes", "AJ1", "Clothing"] },
      { heading: "Kids", links: ["Shop All", "Shoes", "AJ1", "Clothing", "Big Kids", "Little Kids"] },
    ],
  },
  {
    label: "Sport",
    href: "/products",
    mega: [
      { heading: "Basketball", links: ["Shoes", "Apparel", "Equipment", "Jordan", "LeBron"] },
      { heading: "Running", links: ["Road", "Trail", "Racing", "Apparel", "Equipment"] },
      { heading: "Football", links: ["Boots", "Apparel", "Equipment", "Jerseys"] },
      { heading: "Training & Gym", links: ["Shoes", "Apparel", "Equipment"] },
      { heading: "More Sports", links: ["Tennis", "Golf", "Swimming", "Skateboarding", "Volleyball", "Wrestling"] },
    ],
  },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);
  const { totalItems, setIsOpen } = useCart();
  const navigate = useNavigate();
  const { data: settings } = useSiteSettings();

  const brandName = settings?.brand?.name || "STYLE N TUNES";
  const promoBar = settings?.promo_bar ?? { enabled: true, text: "New Members: Get 10% Off With Code", code: "STYLETUNES" };
  const navLinks: NavItem[] = (settings?.nav_links && Array.isArray(settings.nav_links) && settings.nav_links.length > 0)
    ? settings.nav_links
    : defaultNavLinks;

  const handleCategoryClick = (category: string) => {
    setActiveMenu(null);
    setMobileOpen(false);
    setMobileAccordion(null);
    navigate(`/products?category=${encodeURIComponent(category)}`);
  };

  return (
    <>
      {/* Promo bar */}
      {promoBar.enabled && (
        <div className="bg-promo py-2 text-center text-xs font-body tracking-wide">
          <p className="text-foreground">
            {promoBar.text} <span className="font-semibold">{promoBar.code}</span>
          </p>
        </div>
      )}

      {/* Main nav */}
      <header className="sticky top-0 z-40 bg-background border-b border-border">
        <div className="mx-auto flex h-16 max-w-[1920px] items-center justify-between px-6 lg:px-12">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={logoImg} alt={brandName} className="h-8 md:h-10 w-auto" />
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={() => setActiveMenu(link.label)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <Link
                  to={link.href}
                  className={`font-body text-sm font-medium transition-colors py-5 inline-block border-b-2 ${
                    activeMenu === link.label
                      ? "text-foreground border-foreground"
                      : "text-foreground border-transparent hover:text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              </div>
            ))}
            <Link
              to="/drops"
              className="font-body text-sm font-medium text-destructive hover:text-foreground transition-colors py-5 inline-block border-b-2 border-transparent"
            >
              🔥 Drops
            </Link>
            <Link
              to="/community"
              className="font-body text-sm font-medium text-foreground hover:text-muted-foreground transition-colors py-5 inline-block border-b-2 border-transparent"
            >
              Community
            </Link>
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-4">
            <Link to="/products" className="hidden md:flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm text-secondary-foreground">
              <Search size={16} />
              <span className="font-body text-sm">Search</span>
            </Link>
            <Link to="/wishlist" className="text-foreground hover:text-muted-foreground transition-colors">
              <Heart size={22} />
            </Link>
            <Link to="/profile" className="text-foreground hover:text-muted-foreground transition-colors">
              <User size={22} />
            </Link>
            <button
              className="relative text-foreground hover:text-muted-foreground transition-colors"
              onClick={() => setIsOpen(true)}
            >
              <ShoppingBag size={22} />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-body font-semibold rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            <button
              className="lg:hidden text-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mega dropdown */}
        {activeMenu && (
          <div
            className="hidden lg:block absolute left-0 right-0 bg-background border-b border-border shadow-lg z-50"
            onMouseEnter={() => setActiveMenu(activeMenu)}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <div className="mx-auto max-w-[1920px] px-6 lg:px-12 py-10">
              <div className="grid grid-cols-5 gap-8">
                {navLinks
                  .find((l) => l.label === activeMenu)
                  ?.mega?.map((col) => (
                    <div key={col.heading}>
                      <h3 className="font-body text-sm font-semibold text-foreground mb-4">
                        {col.heading}
                      </h3>
                      <ul className="space-y-2.5">
                        {col.links.map((linkText) => (
                          <li key={linkText}>
                            <button
                              onClick={() => handleCategoryClick(linkText)}
                              className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors text-left"
                            >
                              {linkText}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Mobile menu with accordion */}
        {mobileOpen && (
          <nav className="lg:hidden border-t border-border bg-background px-6 py-4 max-h-[80vh] overflow-y-auto">
            {navLinks.map((link) => (
              <div key={link.label} className="border-b border-border">
                <button
                  onClick={() => setMobileAccordion(mobileAccordion === link.label ? null : link.label)}
                  className="flex items-center justify-between w-full py-4"
                >
                  <span className="font-display text-lg font-semibold text-foreground">{link.label}</span>
                  <ChevronDown
                    size={20}
                    className={`text-muted-foreground transition-transform duration-200 ${
                      mobileAccordion === link.label ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {mobileAccordion === link.label && link.mega && (
                  <div className="pb-4 pl-2 space-y-5">
                    {link.mega.map((col) => (
                      <div key={col.heading}>
                        <h4 className="font-body text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          {col.heading}
                        </h4>
                        <ul className="space-y-2">
                          {col.links.map((linkText) => (
                            <li key={linkText}>
                              <button
                                onClick={() => handleCategoryClick(linkText)}
                                className="font-body text-sm text-foreground hover:text-muted-foreground transition-colors text-left"
                              >
                                {linkText}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link
              to="/drops"
              onClick={() => setMobileOpen(false)}
              className="flex items-center py-4 border-b border-border font-display text-lg font-semibold text-destructive"
            >
              🔥 Drops
            </Link>
            <Link
              to="/community"
              onClick={() => setMobileOpen(false)}
              className="flex items-center py-4 border-b border-border font-display text-lg font-semibold text-foreground"
            >
              Community
            </Link>
            <Link
              to="/profile"
              onClick={() => setMobileOpen(false)}
              className="flex items-center py-4 font-display text-lg font-semibold text-foreground"
            >
              My Account
            </Link>
          </nav>
        )}
      </header>
    </>
  );
};

export default Navbar;
