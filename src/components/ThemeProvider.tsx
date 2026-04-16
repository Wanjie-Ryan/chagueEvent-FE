import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const GOOGLE_FONTS_BASE = "https://fonts.googleapis.com/css2?";

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    const theme = settings?.theme;
    if (!theme) return;

    const root = document.documentElement;

    // Apply mode
    if (theme.mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Apply primary color
    root.style.setProperty("--primary", `${theme.primary_hue} ${theme.primary_saturation}% ${theme.primary_lightness}%`);
    // Primary foreground: auto contrast
    const primaryFg = theme.primary_lightness > 50 ? "0 0% 7%" : "0 0% 100%";
    root.style.setProperty("--primary-foreground", primaryFg);

    // Apply accent/destructive color
    root.style.setProperty("--destructive", `${theme.accent_hue} ${theme.accent_saturation}% ${theme.accent_lightness}%`);

    // Apply radius
    root.style.setProperty("--radius", `${theme.radius}rem`);

    // Apply fonts
    if (theme.display_font) {
      root.style.setProperty("--font-display", `'${theme.display_font}', sans-serif`);
    }
    if (theme.body_font) {
      root.style.setProperty("--font-body", `'${theme.body_font}', sans-serif`);
    }

    // Load Google Fonts dynamically
    const fonts = [theme.display_font, theme.body_font].filter(Boolean);
    const uniqueFonts = [...new Set(fonts)];
    const existingLink = document.getElementById("dynamic-google-fonts");
    if (existingLink) existingLink.remove();

    if (uniqueFonts.length > 0) {
      const families = uniqueFonts.map(f => `family=${f.replace(/ /g, "+")}:wght@300;400;500;600;700`).join("&");
      const link = document.createElement("link");
      link.id = "dynamic-google-fonts";
      link.rel = "stylesheet";
      link.href = `${GOOGLE_FONTS_BASE}${families}&display=swap`;
      document.head.appendChild(link);
    }
  }, [settings?.theme]);

  return <>{children}</>;
};

export default ThemeProvider;
