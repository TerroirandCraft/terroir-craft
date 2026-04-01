// Per-brand customisation config
// Add entries here as each brand gets a custom page design

export interface BrandConfig {
  // Hero gradient colors
  heroGradient: { from: string; to: string };
  // Accent / CTA color
  accent: string;
  // Section background (parchment / cream etc.)
  sectionBg: string;
  // Text color on hero
  heroText: string;
  // Optional: special feature section (e.g. The Mollydooker Shake)
  feature?: {
    label: string;       // e.g. "BRAND SIGNATURE"
    heading: string;     // e.g. "The Mollydooker Shake"
    body: string;        // Description paragraph
    visual: {            // Left-side coloured box content
      bg: string;
      line1: string;
      line2: string;
    };
    youtubeId: string;   // YouTube video ID
    videoCaption: string;
  };
}

export const BRAND_CONFIG: Record<string, BrandConfig> = {
  "Mollydooker": {
    heroGradient: { from: "#F5EDD8", to: "#E8C87A" },
    accent: "#D94F2B",
    sectionBg: "#F5EDD8",
    heroText: "#2A1A08",
    feature: {
      label: "BRAND SIGNATURE",
      heading: "The Mollydooker Shake",
      body: "Before opening any Mollydooker bottle, give it a vigorous shake for 30–60 seconds. This unique technique — invented by winemaker Sparky Marquis — reintegrates CO₂ and dissolves oxygen, unlocking the wine's full fruit expression instantly. No decanting needed.",
      visual: {
        bg: "#D94F2B",
        line1: "Do The",
        line2: "Mollydooker Shake",
      },
      youtubeId: "mfbap3Ihdbs",
      videoCaption: "Sparky Marquis demonstrates the Mollydooker Shake technique",
    },
  },
};

// Fallback for brands without a custom config
export const DEFAULT_BRAND_CONFIG: BrandConfig = {
  heroGradient: { from: "#1A0D0D", to: "#6B2233" },
  accent: "hsl(355,62%,28%)",
  sectionBg: "#f8f5f0",
  heroText: "#ffffff",
};

export function getBrandConfig(brand: string): BrandConfig {
  return BRAND_CONFIG[brand] || DEFAULT_BRAND_CONFIG;
}
