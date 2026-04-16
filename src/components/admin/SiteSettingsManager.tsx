import { useState, useEffect } from "react";
import { useSiteSettings, useUpdateSiteSetting } from "@/hooks/useSiteSettings";
import { toast } from "@/hooks/use-toast";
import { Save, Plus, Trash2, ChevronDown, ChevronUp, GripVertical, Image as ImageIcon, Film, Upload } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

const Section = ({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full px-5 py-4 bg-secondary/30">
        <h3 className="font-display text-sm font-bold text-foreground uppercase tracking-wide">{title}</h3>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && <div className="p-5 space-y-4">{children}</div>}
    </div>
  );
};

const Field = ({ label, value, onChange, type = "text", rows, placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; rows?: number; placeholder?: string }) => (
  <div>
    <label className="font-body text-xs text-muted-foreground block mb-1">{label}</label>
    {rows ? (
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder}
        className="w-full border border-border bg-background text-foreground px-4 py-2.5 font-body text-sm focus:outline-none focus:border-foreground resize-none" />
    ) : (
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full border border-border bg-background text-foreground px-4 py-2.5 font-body text-sm focus:outline-none focus:border-foreground" />
    )}
  </div>
);

const FONT_OPTIONS = [
  "Oswald", "Inter", "Montserrat", "Playfair Display", "Roboto", "Poppins", "Raleway",
  "Lato", "Open Sans", "Bebas Neue", "DM Sans", "Space Grotesk", "Archivo Black",
  "Barlow Condensed", "Fjalla One", "Teko", "Anton",
];

type HeroSlide = {
  type: "image" | "video";
  src: string;
  headline: string;
  subtitle: string;
  description: string;
  ctaPrimaryLabel: string;
  ctaPrimaryTo: string;
  ctaSecondaryLabel: string;
  ctaSecondaryTo: string;
};

const emptySlide: HeroSlide = {
  type: "image",
  src: "",
  headline: "",
  subtitle: "",
  description: "",
  ctaPrimaryLabel: "Shop Now",
  ctaPrimaryTo: "/products",
  ctaSecondaryLabel: "Learn More",
  ctaSecondaryTo: "/products",
};

const SiteSettingsManager = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSetting = useUpdateSiteSetting();

  const [brand, setBrand] = useState({ name: "", tagline: "" });
  const [promoBar, setPromoBar] = useState({ enabled: true, text: "", code: "" });
  const [footer, setFooter] = useState<any>({ columns: {}, copyright: "", links: [] });
  const [social, setSocial] = useState({ instagram: "", twitter: "", tiktok: "", youtube: "" });
  const [contact, setContact] = useState({ email: "", phone: "", address: "" });
  const [navLinks, setNavLinks] = useState<any[]>([]);
  const [notifications, setNotifications] = useState({ admin_email: "" });
  const [theme, setTheme] = useState({
    mode: "light",
    primary_hue: 0, primary_saturation: 0, primary_lightness: 7,
    accent_hue: 0, accent_saturation: 84, accent_lightness: 60,
    radius: 0,
    display_font: "Oswald",
    body_font: "Inter",
  });
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);

  useEffect(() => {
    if (!settings) return;
    if (settings.brand) setBrand(settings.brand);
    if (settings.promo_bar) setPromoBar(settings.promo_bar);
    if (settings.footer) setFooter(settings.footer);
    if (settings.social_links) setSocial(settings.social_links);
    if (settings.contact) setContact(settings.contact);
    if (settings.nav_links && Array.isArray(settings.nav_links) && settings.nav_links.length > 0) setNavLinks(settings.nav_links);
    if (settings.theme) setTheme(settings.theme);
    if (settings.notifications) setNotifications(settings.notifications);
    if (settings.hero_slides && Array.isArray(settings.hero_slides) && settings.hero_slides.length > 0) setHeroSlides(settings.hero_slides);
  }, [settings]);

  const save = async (key: string, value: any) => {
    try {
      await updateSetting.mutateAsync({ key, value });
      toast({ title: "Settings saved" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const updateSlide = (index: number, updates: Partial<HeroSlide>) => {
    setHeroSlides(prev => prev.map((s, i) => i === index ? { ...s, ...updates } : s));
  };

  const moveSlide = (from: number, to: number) => {
    if (to < 0 || to >= heroSlides.length) return;
    const arr = [...heroSlides];
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    setHeroSlides(arr);
  };

  if (isLoading) return <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" /></div>;

  const previewColor = `hsl(${theme.primary_hue}, ${theme.primary_saturation}%, ${theme.primary_lightness}%)`;
  const previewAccent = `hsl(${theme.accent_hue}, ${theme.accent_saturation}%, ${theme.accent_lightness}%)`;

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl font-semibold text-foreground mb-6">Site Settings</h2>

      <Section title="🎨 Theme & Appearance" defaultOpen>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="font-body text-xs text-muted-foreground block mb-2">Default Mode</label>
              <div className="flex gap-2">
                {["light", "dark"].map(m => (
                  <button key={m} onClick={() => setTheme({ ...theme, mode: m })}
                    className={`px-4 py-2 font-body text-sm border ${theme.mode === m ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground"}`}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="font-body text-xs text-muted-foreground block mb-2">Primary Color</label>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 border border-border" style={{ backgroundColor: previewColor }} />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-body text-[10px] text-muted-foreground w-8">H</span>
                    <input type="range" min={0} max={360} value={theme.primary_hue} onChange={(e) => setTheme({ ...theme, primary_hue: +e.target.value })} className="flex-1" />
                    <span className="font-body text-xs text-muted-foreground w-8">{theme.primary_hue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-body text-[10px] text-muted-foreground w-8">S</span>
                    <input type="range" min={0} max={100} value={theme.primary_saturation} onChange={(e) => setTheme({ ...theme, primary_saturation: +e.target.value })} className="flex-1" />
                    <span className="font-body text-xs text-muted-foreground w-8">{theme.primary_saturation}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-body text-[10px] text-muted-foreground w-8">L</span>
                    <input type="range" min={0} max={100} value={theme.primary_lightness} onChange={(e) => setTheme({ ...theme, primary_lightness: +e.target.value })} className="flex-1" />
                    <span className="font-body text-xs text-muted-foreground w-8">{theme.primary_lightness}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="font-body text-xs text-muted-foreground block mb-2">Accent Color (Destructive/Sale)</label>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 border border-border" style={{ backgroundColor: previewAccent }} />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-body text-[10px] text-muted-foreground w-8">H</span>
                    <input type="range" min={0} max={360} value={theme.accent_hue} onChange={(e) => setTheme({ ...theme, accent_hue: +e.target.value })} className="flex-1" />
                    <span className="font-body text-xs text-muted-foreground w-8">{theme.accent_hue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-body text-[10px] text-muted-foreground w-8">S</span>
                    <input type="range" min={0} max={100} value={theme.accent_saturation} onChange={(e) => setTheme({ ...theme, accent_saturation: +e.target.value })} className="flex-1" />
                    <span className="font-body text-xs text-muted-foreground w-8">{theme.accent_saturation}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-body text-[10px] text-muted-foreground w-8">L</span>
                    <input type="range" min={0} max={100} value={theme.accent_lightness} onChange={(e) => setTheme({ ...theme, accent_lightness: +e.target.value })} className="flex-1" />
                    <span className="font-body text-xs text-muted-foreground w-8">{theme.accent_lightness}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="font-body text-xs text-muted-foreground block mb-2">Display Font (Headings)</label>
              <select value={theme.display_font} onChange={(e) => setTheme({ ...theme, display_font: e.target.value })}
                className="w-full border border-border bg-background text-foreground px-4 py-2.5 font-body text-sm focus:outline-none focus:border-foreground">
                {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="font-body text-xs text-muted-foreground block mb-2">Body Font</label>
              <select value={theme.body_font} onChange={(e) => setTheme({ ...theme, body_font: e.target.value })}
                className="w-full border border-border bg-background text-foreground px-4 py-2.5 font-body text-sm focus:outline-none focus:border-foreground">
                {FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="font-body text-xs text-muted-foreground block mb-2">Border Radius: {theme.radius}rem</label>
              <input type="range" min={0} max={1.5} step={0.125} value={theme.radius}
                onChange={(e) => setTheme({ ...theme, radius: +e.target.value })} className="w-full" />
              <div className="flex gap-2 mt-2">
                <div className="w-16 h-10 bg-foreground" style={{ borderRadius: `${theme.radius}rem` }} />
                <span className="font-body text-xs text-muted-foreground self-center">Preview</span>
              </div>
            </div>

            <div className="p-4 border border-border bg-secondary/20 space-y-2">
              <p className="font-body text-xs text-muted-foreground">Preview</p>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 font-body text-xs text-white" style={{ backgroundColor: previewColor, borderRadius: `${theme.radius}rem` }}>
                  Primary Button
                </div>
                <div className="px-4 py-2 font-body text-xs text-white" style={{ backgroundColor: previewAccent, borderRadius: `${theme.radius}rem` }}>
                  Sale Badge
                </div>
              </div>
            </div>
          </div>
        </div>
        <button onClick={() => save("theme", theme)} className="bg-primary text-primary-foreground px-5 py-2 font-body text-sm font-medium hover:opacity-90 flex items-center gap-2 mt-2">
          <Save size={14} /> Save Theme
        </button>
      </Section>

      <Section title="🖼️ Hero Slides">
        <p className="font-body text-xs text-muted-foreground mb-4">
          Manage the homepage hero carousel. Leave empty to use defaults. Add image or video slides with headlines, descriptions, and call-to-action buttons.
        </p>
        <div className="space-y-4">
          {heroSlides.map((slide, i) => (
            <div key={i} className="border border-border p-4 space-y-3 bg-secondary/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => moveSlide(i, i - 1)} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30"><ChevronUp size={14} /></button>
                    <button onClick={() => moveSlide(i, i + 1)} disabled={i === heroSlides.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30"><ChevronDown size={14} /></button>
                  </div>
                  <span className="font-body text-xs font-medium text-foreground">Slide {i + 1}</span>
                  {slide.type === "video" ? <Film size={14} className="text-muted-foreground" /> : <ImageIcon size={14} className="text-muted-foreground" />}
                </div>
                <button onClick={() => setHeroSlides(prev => prev.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-body text-[10px] text-muted-foreground block mb-1">Type</label>
                  <select value={slide.type} onChange={(e) => updateSlide(i, { type: e.target.value as "image" | "video" })}
                    className="w-full border border-border bg-background text-foreground px-3 py-2 font-body text-xs focus:outline-none focus:border-foreground">
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>
                <div>
                  <Field label="Source URL" value={slide.src} onChange={(v) => updateSlide(i, { src: v })} placeholder="/videos/hero.mp4 or https://..." />
                  {slide.type === "image" && (
                    <div className="mt-1">
                      <ImageUpload currentUrl={slide.src} onUploaded={(url) => updateSlide(i, { src: url })} />
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Headline" value={slide.headline} onChange={(v) => updateSlide(i, { headline: v })} placeholder="'STREET GOLD'" />
                <Field label="Subtitle" value={slide.subtitle} onChange={(v) => updateSlide(i, { subtitle: v })} placeholder="Spring '26 Collection" />
              </div>
              <Field label="Description" value={slide.description} onChange={(v) => updateSlide(i, { description: v })} placeholder="Where style meets rhythm..." />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Field label="CTA 1 Label" value={slide.ctaPrimaryLabel} onChange={(v) => updateSlide(i, { ctaPrimaryLabel: v })} />
                <Field label="CTA 1 Link" value={slide.ctaPrimaryTo} onChange={(v) => updateSlide(i, { ctaPrimaryTo: v })} />
                <Field label="CTA 2 Label" value={slide.ctaSecondaryLabel} onChange={(v) => updateSlide(i, { ctaSecondaryLabel: v })} />
                <Field label="CTA 2 Link" value={slide.ctaSecondaryTo} onChange={(v) => updateSlide(i, { ctaSecondaryTo: v })} placeholder="Leave empty for play btn" />
              </div>
              {slide.src && slide.type === "image" && (
                <img src={slide.src} alt="preview" className="h-20 w-32 object-cover border border-border" />
              )}
            </div>
          ))}
        </div>
        <button onClick={() => setHeroSlides(prev => [...prev, { ...emptySlide }])}
          className="flex items-center gap-2 border border-dashed border-border px-4 py-2.5 font-body text-sm text-muted-foreground hover:text-foreground hover:border-foreground transition-colors w-full justify-center">
          <Plus size={14} /> Add Slide
        </button>
        <button onClick={() => save("hero_slides", heroSlides)} className="bg-primary text-primary-foreground px-5 py-2 font-body text-sm font-medium hover:opacity-90 flex items-center gap-2">
          <Save size={14} /> Save Hero Slides
        </button>
      </Section>

      <Section title="Branding">
        <Field label="Site Name" value={brand.name} onChange={(v) => setBrand({ ...brand, name: v })} />
        <Field label="Tagline" value={brand.tagline} onChange={(v) => setBrand({ ...brand, tagline: v })} rows={2} />
        <button onClick={() => save("brand", brand)} className="bg-primary text-primary-foreground px-5 py-2 font-body text-sm font-medium hover:opacity-90 flex items-center gap-2">
          <Save size={14} /> Save Branding
        </button>
      </Section>

      <Section title="Promo Bar">
        <div className="flex items-center gap-3 mb-3">
          <label className="font-body text-xs text-muted-foreground">Enabled</label>
          <input type="checkbox" checked={promoBar.enabled} onChange={(e) => setPromoBar({ ...promoBar, enabled: e.target.checked })} className="accent-primary" />
        </div>
        <Field label="Promo Text" value={promoBar.text} onChange={(v) => setPromoBar({ ...promoBar, text: v })} />
        <Field label="Promo Code" value={promoBar.code} onChange={(v) => setPromoBar({ ...promoBar, code: v })} />
        <button onClick={() => save("promo_bar", promoBar)} className="bg-primary text-primary-foreground px-5 py-2 font-body text-sm font-medium hover:opacity-90 flex items-center gap-2">
          <Save size={14} /> Save Promo Bar
        </button>
      </Section>

      <Section title="Footer">
        <Field label="Copyright Text" value={footer.copyright || ""} onChange={(v) => setFooter({ ...footer, copyright: v })} />
        <div className="space-y-3">
          <label className="font-body text-xs text-muted-foreground">Footer Columns (JSON)</label>
          <textarea value={JSON.stringify(footer.columns || {}, null, 2)} onChange={(e) => {
            try { setFooter({ ...footer, columns: JSON.parse(e.target.value) }); } catch {}
          }} rows={8} className="w-full border border-border bg-background text-foreground px-4 py-2.5 font-body text-xs font-mono focus:outline-none focus:border-foreground resize-none" />
        </div>
        <div className="space-y-3">
          <label className="font-body text-xs text-muted-foreground">Footer Links (JSON array)</label>
          <textarea value={JSON.stringify(footer.links || [], null, 2)} onChange={(e) => {
            try { setFooter({ ...footer, links: JSON.parse(e.target.value) }); } catch {}
          }} rows={4} className="w-full border border-border bg-background text-foreground px-4 py-2.5 font-body text-xs font-mono focus:outline-none focus:border-foreground resize-none" />
        </div>
        <button onClick={() => save("footer", footer)} className="bg-primary text-primary-foreground px-5 py-2 font-body text-sm font-medium hover:opacity-90 flex items-center gap-2">
          <Save size={14} /> Save Footer
        </button>
      </Section>

      <Section title="Social Links">
        <Field label="Instagram URL" value={social.instagram} onChange={(v) => setSocial({ ...social, instagram: v })} />
        <Field label="Twitter / X URL" value={social.twitter} onChange={(v) => setSocial({ ...social, twitter: v })} />
        <Field label="TikTok URL" value={social.tiktok} onChange={(v) => setSocial({ ...social, tiktok: v })} />
        <Field label="YouTube URL" value={social.youtube} onChange={(v) => setSocial({ ...social, youtube: v })} />
        <button onClick={() => save("social_links", social)} className="bg-primary text-primary-foreground px-5 py-2 font-body text-sm font-medium hover:opacity-90 flex items-center gap-2">
          <Save size={14} /> Save Social Links
        </button>
      </Section>

      <Section title="📧 Notifications">
        <p className="font-body text-xs text-muted-foreground mb-3">
          Set the email address that receives order notifications whenever a new order is placed.
        </p>
        <Field label="Admin Notification Email" value={notifications.admin_email} onChange={(v) => setNotifications({ ...notifications, admin_email: v })} placeholder="your@email.com" />
        <button onClick={() => save("notifications", notifications)} className="bg-primary text-primary-foreground px-5 py-2 font-body text-sm font-medium hover:opacity-90 flex items-center gap-2">
          <Save size={14} /> Save Notifications
        </button>
      </Section>

      <Section title="Contact Info">
        <Field label="Email" value={contact.email} onChange={(v) => setContact({ ...contact, email: v })} />
        <Field label="Phone" value={contact.phone} onChange={(v) => setContact({ ...contact, phone: v })} />
        <Field label="Address" value={contact.address} onChange={(v) => setContact({ ...contact, address: v })} rows={2} />
        <button onClick={() => save("contact", contact)} className="bg-primary text-primary-foreground px-5 py-2 font-body text-sm font-medium hover:opacity-90 flex items-center gap-2">
          <Save size={14} /> Save Contact Info
        </button>
      </Section>

      <Section title="Navigation Menu">
        <p className="font-body text-xs text-muted-foreground mb-3">
          Edit navigation links as JSON. Leave empty to use defaults. Each item: {"{"}"label", "href", "mega": [{"{"}"heading", "links": [...]{"}"}, ...]{"}"}
        </p>
        <textarea value={navLinks.length > 0 ? JSON.stringify(navLinks, null, 2) : ""} onChange={(e) => {
          try { setNavLinks(JSON.parse(e.target.value)); } catch {}
        }} rows={12} placeholder="Leave empty to use default navigation" className="w-full border border-border bg-background text-foreground px-4 py-2.5 font-body text-xs font-mono focus:outline-none focus:border-foreground resize-none" />
        <button onClick={() => save("nav_links", navLinks)} className="bg-primary text-primary-foreground px-5 py-2 font-body text-sm font-medium hover:opacity-90 flex items-center gap-2">
          <Save size={14} /> Save Navigation
        </button>
      </Section>
    </div>
  );
};

export default SiteSettingsManager;
