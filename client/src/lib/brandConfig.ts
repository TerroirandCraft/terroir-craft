// Per-brand customisation config
// Add entries here as each brand gets a custom page design

export interface BrandConfig {
  heroGradient: { from: string; to: string };
  accent: string;
  sectionBg: string;
  heroText: string;
  heroBg?: string;
  heritage?: {
    year: string;
    tagline: string;
    yearFont?: string;
    yearColor?: string;   // defaults to accent color
  };
  // Optional booklet / brochure download section
  booklet?: {
    label: string;
    heading: string;
    description: string;
    downloadUrl: string;
    downloadLabel: string;
    coverImage?: string;
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
  "Château de Saint Cosme": {
    heroBg: "/sc-chapel.jpg",
    heroGradient: { from: "#2C1A0E", to: "#4A2E1A" },
    accent: "#8B6914",
    sectionBg: "#F5EDD0",
    heroText: "#ffffff",
    heritage: {
      year: "Est. 1570",
      tagline: "GIGONDAS · RHÔNE VALLEY · 15TH GENERATION",
      yearFont: "Cinzel",
      yearColor: "#1A0D08",
    },
    booklet: {
      label: "2024 VINTAGE BOOKLET",
      heading: "From the Cellar",
      description: "Louis Barruol's annual booklet — a beautifully written account of the vintage, the philosophy behind Saint Cosme's winemaking, and the stories that shape each bottle.",
      downloadUrl: "/saint-cosme-booklet-2026.pdf",
      downloadLabel: "Download 2024 Vintage Booklet",
      coverImage: "/sc-booklet-cover.jpg",
    },
    feature: {
      label: "ESTATE & TERROIR",
      heading: "Ancient Vines, Limestone Soul",
      body: "The estate's vineyards sit on the limestone slopes of Gigondas, home to century-old Grenache vines whose roots reach deep into the schist. Every vine tells a story — of seasons survived, harvests given, and a terroir unlike anywhere else in the Rhône.",
      image: "/sc-vines.jpg",
      visual: { bg: "#2C1A0E", line1: "Est.", line2: "1490" },
      youtubeId: "",
      videoCaption: "",
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
  // Exact match first
  if (BRAND_CONFIG[brand]) return BRAND_CONFIG[brand];
  // Case-insensitive / accent-insensitive fallback
  const lower = brand.toLowerCase();
  const match = Object.keys(BRAND_CONFIG).find(k => k.toLowerCase() === lower);
  return match ? BRAND_CONFIG[match] : DEFAULT_BRAND_CONFIG;
}
