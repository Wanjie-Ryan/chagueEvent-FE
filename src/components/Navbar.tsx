import { Search, Heart, Menu, X, User } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useAuth } from "@/hooks/useAuth";
import logoImg from "@/assets/logo.png";

type NavItem = { label: string; href: string };

const defaultNavLinks: NavItem[] = [
  { label: "Photography", href: "/products?category=photography" },
  { label: "Catering", href: "/products?category=catering" },
  { label: "Decor", href: "/products?category=decor" },
  { label: "Entertainment", href: "/products?category=entertainment" },
  { label: "Venue", href: "/products?category=venue" },
  { label: "Other Services", href: "/products?category=other" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { data: settings } = useSiteSettings();
  const { user } = useAuth();

  const brandName = settings?.brand?.name || "STYLE N TUNES";
  const navLinks: NavItem[] = defaultNavLinks;

  return (
    <>
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
              <div key={link.label} className="relative">
                <Link
                  to={link.href}
                  className="font-body text-sm font-medium transition-colors py-5 inline-block text-foreground border-transparent hover:text-muted-foreground border-b-2 hover:-translate-y-[1px]"
                >
                  {link.label}
                </Link>
              </div>
            ))}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-4">
            <Link to="/products" className="hidden md:flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-sm text-secondary-foreground hover:bg-secondary/80 transition-colors">
              <Search size={16} />
              <span className="font-body text-sm">Directory</span>
            </Link>
            <Link to="/profile" className="text-foreground hover:text-muted-foreground transition-colors hidden sm:block">
              <Heart size={22} />
            </Link>
            {!user && (
                <Link to="/auth" className="text-foreground hover:text-muted-foreground transition-colors">
                  <User size={22} />
                </Link>
            )}
            <button
              className="lg:hidden text-foreground ml-2"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <nav className="lg:hidden border-t border-border bg-background px-6 py-4 max-h-[80vh] overflow-y-auto shadow-xl">
            <div className="space-y-1 mb-6">
              {navLinks.map((link) => (
                <div key={link.label} className="border-b border-border/50">
                  <Link
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center w-full py-4 font-display text-lg font-semibold text-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </div>
              ))}
            </div>
            
            <Link
              to="/products"
              onClick={() => setMobileOpen(false)}
              className="flex items-center py-4 border-b border-border font-display text-lg font-semibold text-foreground/80"
            >
              All Services Directory
            </Link>
            {!user && (
              <Link
                to="/auth"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center py-4 mt-8 rounded-full bg-foreground font-display text-lg font-semibold text-background w-full"
              >
                Sign In / Partner With Us
              </Link>
            )}
          </nav>
        )}
      </header>
    </>
  );
};

export default Navbar;
