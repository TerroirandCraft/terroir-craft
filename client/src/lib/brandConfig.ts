// Per-brand customisation config
// Add entries here as each brand gets a custom page design

export interface BrandConfig {
  heroGradient: { from: string; to: string };
  accent: string;
  sectionBg: string;
  heroText: string;
  // Optional full-bleed hero background image (overrides gradient)
  heroBg?: string;
  // Heritage callout — large gold year + tagline overlaid on hero
  heritage?: {
    year: string;         // e.g. "1638"
    tagline: string;      // e.g. "THE OLDEST PORT WINE HOUSE"
    yearFont?: string;    // Google Font name for the year
  };
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
  "Kopke": {
    heroBg: "/kopke-cellar.jpg",
    heroGradient: { from: "#0d0b08", to: "#1a1410" },
    accent: "#eb9d00",
    sectionBg: "#0d0b08",
    heroText: "#ffffff",
    heritage: {
      year: "1638",
      tagline: "THE OLDEST PORT WINE HOUSE",
      yearFont: "Cinzel",
    },
    feature: {
      label: "DOURO VALLEY",
      heading: "Where It All Begins",
      body: "High above the Douro River, Kopke's estate vineyards produce the finest Touriga Nacional and Touriga Franca grapes. The dramatic terraced hillsides, carved from schist rock over centuries, give Kopke Port its unmistakable depth and complexity — a tradition kept alive since 1638.",
      image: "/kopke-vineyard.jpg",
      visual: { bg: "#1a1410", line1: "Est.", line2: "1638" },
      youtubeId: "",
      videoCaption: "",
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
