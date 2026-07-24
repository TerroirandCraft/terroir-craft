import { useEffect } from "react";

interface SeoHeadProps {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  jsonLd?: object;
  canonical?: string;
}

const BASE_URL = "https://www.terroirandcraft.online";
const DEFAULT_IMAGE = `${BASE_URL}/bottle-shots/og-default.png`;

export default function SeoHead({
  title,
  description,
  ogTitle,
  ogDescription,
  ogImage,
  ogUrl,
  ogType = "website",
  jsonLd,
  canonical,
}: SeoHeadProps) {
  useEffect(() => {
    // ── Title ──────────────────────────────────────────────────────────────
    if (title) document.title = title;

    // ── Meta description ───────────────────────────────────────────────────
    setMeta("name", "description", description || "");

    // ── Open Graph ─────────────────────────────────────────────────────────
    setMeta("property", "og:title", ogTitle || title || "");
    setMeta("property", "og:description", ogDescription || description || "");
    setMeta("property", "og:image", ogImage || DEFAULT_IMAGE);
    setMeta("property", "og:url", ogUrl || (BASE_URL + window.location.pathname));
    setMeta("property", "og:type", ogType);
    setMeta("property", "og:site_name", "Terroir & Craft 天地人酒業");
    setMeta("property", "og:locale", "zh_HK");

    // ── Twitter Card ───────────────────────────────────────────────────────
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", ogTitle || title || "");
    setMeta("name", "twitter:description", ogDescription || description || "");
    setMeta("name", "twitter:image", ogImage || DEFAULT_IMAGE);

    // ── Canonical ──────────────────────────────────────────────────────────
    if (canonical) {
      let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonical;
    }

    // ── JSON-LD ────────────────────────────────────────────────────────────
    if (jsonLd) {
      const existing = document.getElementById("page-jsonld");
      if (existing) existing.remove();
      const script = document.createElement("script");
      script.id = "page-jsonld";
      script.type = "application/ld+json";
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }

    // cleanup on unmount
    return () => {
      const s = document.getElementById("page-jsonld");
      if (s) s.remove();
    };
  }, [title, description, ogTitle, ogDescription, ogImage, ogUrl, ogType, jsonLd, canonical]);

  return null;
}

function setMeta(attr: "name" | "property", key: string, value: string) {
  if (!value) return;
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = value;
}
