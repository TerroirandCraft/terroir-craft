// Per-brand customisation config
// Add entries here as each brand gets a custom page design

export interface BrandConfig {
  heroGradient: { from: string; to: string };
  accent: string;
  sectionBg: string;
  heroText: string;
  feature?: {
    label: string;
    heading: string;
    body: string;
    image?: string;       // Real photo URL/path — shown instead of coloured box
    visual: {
      bg: string;
      line1: string;
      line2: string;
    };
    youtubeId: string;
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
      image: "/mollydooker-shake.jpg",
      visual: {
        bg: "#D94F2B",
        line1: "Do The",
        line2: "Mollydooker Shake",
      },
      youtubeId: "mfbap3Ihdbs",
      videoCaption: "Luke Marquis demonstrates the Mollydooker Shake technique",
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
