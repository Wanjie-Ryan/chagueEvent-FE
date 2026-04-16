import { useEffect } from "react";

type SEOProps = {
  title?: string;
  description?: string;
  canonical?: string;
  type?: string;
};

const useSEO = ({ title, description, canonical, type = "website" }: SEOProps) => {
  useEffect(() => {
    const suffix = " | Style n Tunes";

    if (title) {
      document.title = title.includes("Style n Tunes") ? title : `${title}${suffix}`;
    }
    if (description) {
      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", description);
    }
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonical;
    }

    // OG tags
    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    if (title) setMeta("og:title", title);
    if (description) setMeta("og:description", description);
    if (type) setMeta("og:type", type);
    if (canonical) setMeta("og:url", canonical);
  }, [title, description, canonical, type]);
};

export default useSEO;
