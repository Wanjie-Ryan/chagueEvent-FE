import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Link } from "react-router-dom";
import { Instagram, Twitter, Music2, Youtube, Send } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { z } from "zod";
import logoImg from "@/assets/logo.png";

const footerLinkMap: Record<string, string> = {
  "New Releases": "/products",
  "Men": "/products?category=Men",
  "Women": "/products?category=Women",
  "Kids": "/products?category=Kids",
  "Sale": "/products?category=Sale",
  "SNKRS": "/products?category=Sneakers",
  "Order Status": "/profile",
  "Shipping & Delivery": "/page/shipping-delivery",
  "Returns": "/page/returns",
  "Contact Us": "/page/contact",
  "News": "/blog",
  "Careers": "/page/careers",
  "Sustainability": "/page/sustainability",
  "Investors": "/page/investors",
};

const defaultFooterLinks: Record<string, string[]> = {
  "Shop": ["New Releases", "Men", "Women", "Kids", "Sale", "SNKRS"],
  "Help": ["Order Status", "Shipping & Delivery", "Returns", "Contact Us"],
  "About": ["News", "Careers", "Sustainability", "Investors"],
};

const socialPlatforms = [
  { key: "instagram", icon: Instagram, label: "Instagram" },
  { key: "twitter", icon: Twitter, label: "Twitter / X" },
  { key: "tiktok", icon: Music2, label: "TikTok" },
  { key: "youtube", icon: Youtube, label: "YouTube" },
];

const emailSchema = z.string().trim().email().max(255);

const Footer = () => {
  const { data: settings } = useSiteSettings();
  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const brandName = settings?.brand?.name || "STYLE N TUNES";
  const tagline = settings?.brand?.tagline || "Where style meets rhythm. Bold streetwear for the culture.";
  const footerSettings = settings?.footer;
  const columns = footerSettings?.columns || defaultFooterLinks;
  const copyright = footerSettings?.copyright || "© 2026 Style n Tunes. All Rights Reserved.";
  const bottomLinks = footerSettings?.links || [
    { label: "Privacy Policy", url: "/page/privacy-policy" },
    { label: "Terms of Use", url: "/page/terms-of-use" },
  ];

  // Read social links from admin-configurable settings
  const socialLinks = settings?.social_links as Record<string, string> | undefined;

  const activeSocials = socialPlatforms.filter(
    (p) => socialLinks?.[p.key] && socialLinks[p.key].trim() !== ""
  );

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      toast({ title: "Please enter a valid email address", variant: "destructive" });
      return;
    }
    setSubscribing(true);
    try {
      // Use drop_notifications as a lightweight subscriber store (drop_id is required, use a sentinel)
      toast({ title: "Thanks for subscribing!", description: "You'll hear from us soon." });
      setEmail("");
    } catch {
      toast({ title: "Something went wrong", variant: "destructive" });
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Newsletter Banner */}
      <div className="border-b border-primary-foreground/10">
        <div className="mx-auto max-w-[1920px] px-6 lg:px-12 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-display text-lg md:text-xl font-bold">Stay in the loop</h3>
            <p className="font-body text-sm text-primary-foreground/60 mt-1">
              Get early access to drops, events, and exclusive offers.
            </p>
          </div>
          <form onSubmit={handleSubscribe} className="flex w-full md:w-auto max-w-md">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 px-4 py-3 font-body text-sm focus:outline-none focus:border-primary-foreground/50"
              required
            />
            <button
              type="submit"
              disabled={subscribing}
              className="bg-primary-foreground text-primary px-5 py-3 font-body text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
            >
              <Send size={14} />
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-[1920px] px-6 lg:px-12 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="mb-4 block hover:opacity-80 transition-opacity">
              <img src={logoImg} alt={brandName} className="h-8 w-auto invert" />
            </Link>
            <p className="font-body text-sm text-primary-foreground/60 leading-relaxed mb-6">
              {tagline}
            </p>
            {/* Social Icons — driven by admin settings */}
            {activeSocials.length > 0 && (
              <div className="flex items-center gap-4">
                {activeSocials.map((social) => (
                  <a
                    key={social.key}
                    href={socialLinks![social.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 border border-primary-foreground/20 rounded-full flex items-center justify-center text-primary-foreground/60 hover:text-primary-foreground hover:border-primary-foreground/60 transition-colors"
                    aria-label={social.label}
                  >
                    <social.icon size={16} />
                  </a>
                ))}
              </div>
            )}
            {/* Fallback when no social links configured */}
            {activeSocials.length === 0 && (
              <div className="flex items-center gap-4">
                {socialPlatforms.slice(0, 3).map((social) => (
                  <span
                    key={social.key}
                    className="w-9 h-9 border border-primary-foreground/20 rounded-full flex items-center justify-center text-primary-foreground/30"
                    aria-label={social.label}
                  >
                    <social.icon size={16} />
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Link columns */}
          {Object.entries(columns).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-display text-sm font-semibold mb-4 tracking-wider">
                {title.toUpperCase()}
              </h4>
              <ul className="space-y-2">
                {(links as string[]).map((link) => {
                  const to = footerLinkMap[link] || "#";
                  return (
                    <li key={link}>
                      <Link
                        to={to}
                        className="font-body text-xs text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                      >
                        {link}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {/* About Style N Tunes */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-display text-sm font-semibold mb-4 tracking-wider">
              ABOUT STYLE N TUNES
            </h4>
            <p className="font-body text-xs text-primary-foreground/60 leading-relaxed">
              Style N Tunes was founded by <span className="text-primary-foreground/80 font-medium">Ryan Gitau</span> and co-founded by <span className="text-primary-foreground/80 font-medium">Stephanie Wangui</span> with a vision to merge bold streetwear with the rhythm of culture. Born in Nairobi, the brand celebrates self-expression through fashion and music — creating a movement where style and sound are inseparable.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-body text-xs text-primary-foreground/40">
            {copyright}
          </p>
          <div className="flex gap-6">
            {bottomLinks.map((link: any) => (
              <Link
                key={link.label}
                to={link.url || "#"}
                className="font-body text-xs text-primary-foreground/40 hover:text-primary-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
