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
    image?: string;
    imageCaption?: string;
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
      yearColor: "#C8391A",
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
      imageCaption: "Le Poste — Gigondas",
      visual: { bg: "#2C1A0E", line1: "Est.", line2: "1490" },
      youtubeId: "",
      videoCaption: "",
    },
  },
  // ── Champagne Boizel ─────────────────────────────────────────────────────
  "Champagne Boizel": {
    heroBg: "/boizel-hero.jpg",
    heroGradient: { from: "#1C1C1C", to: "#2E2A26" },
    accent: "#C8A96E",
    sectionBg: "#1A1815",
    heroText: "#ffffff",
    heritage: { year: "Est. 1834", tagline: "MAISON FONDÉE EN 1834 · ÉPERNAY", yearFont: "Cinzel", yearColor: "#C8A96E" },
  },

  // ── Sherwood Estate ───────────────────────────────────────────────────────
  "Sherwood": {
    heroBg: "/sherwood-hero.jpg",
    heroGradient: { from: "#2E3D2A", to: "#4A6741" },
    accent: "#4A6741",
    sectionBg: "#F2EDE5",
    heroText: "#ffffff",
    heritage: { year: "Est. 1987", tagline: "WAIPARA VALLEY · NEW ZEALAND", yearFont: "Cinzel", yearColor: "#ffffff" },
  },

  // ── Tscharke ──────────────────────────────────────────────────────────────
  "Tscharke": {
    heroBg: "/tscharke-hero.jpg",
    heroGradient: { from: "#08200B", to: "#0E3012" },
    accent: "#7AB86A",
    sectionBg: "#0d1a0f",
    heroText: "#ffffff",
    heritage: { year: "Est. 1847", tagline: "BAROSSA VALLEY · SIX GENERATIONS", yearFont: "Cinzel", yearColor: "#7AB86A" },
    feature: {
      label: "OLD VINES · ORGANIC",
      heading: "Ancient Roots",
      body: "Damien Tscharke farms heritage Grenache, Shiraz and Mataro vines planted in the 1840s using organic and biodynamic methods. The ancient soils of the Barossa yield wines of extraordinary concentration and authenticity — a living connection to six generations of family history.",
      image: "/tscharke-hero.jpg",
      visual: { bg: "#08200B", line1: "Est.", line2: "1847" },
      youtubeId: "",
      videoCaption: "",
    },
  },

  // ── Realm Cellars ─────────────────────────────────────────────────────────
  "Realm Cellars": {
    heroBg: "/realm-hero.jpg",
    heroGradient: { from: "#F2EDE4", to: "#EAE2D6" },
    accent: "#2C1810",
    sectionBg: "#FFFFFF",
    heroText: "#1A1410",
    heritage: { year: "Est. 2003", tagline: "NAPA VALLEY · CALIFORNIA", yearFont: "Cinzel", yearColor: "#2C1810" },
  },

  // ── Pasqua ────────────────────────────────────────────────────────────────
  "Pasqua": {
    heroBg: "/pasqua-hero.jpg",
    heroGradient: { from: "#8B2A12", to: "#6F3520" },
    accent: "#F4B942",
    sectionBg: "#FDF6F0",
    heroText: "#ffffff",
    heritage: { year: "Est. 1925", tagline: "HOUSE OF THE UNCONVENTIONAL · VERONA", yearFont: "Cinzel", yearColor: "#F4B942" },
  },

  // ── Levrier Wines by Jo Irvine ────────────────────────────────────────────
  "Levrier Wines by Jo Irvine": {
    heroBg: "/levrier-hero.jpg",
    heroGradient: { from: "#2A1240", to: "#735490" },
    accent: "#CC9E29",
    sectionBg: "#1A0A2E",
    heroText: "#ffffff",
    heritage: { year: "Barossa", tagline: "FORGOTTEN VARIETALS · BAROSSA VALLEY", yearFont: "Josefin Sans", yearColor: "#735490" },
  },

  // ── Vereinigte Hospitien ──────────────────────────────────────────────────
  "Vereinigte Hospitien": {
    heroBg: "/vh-hero.jpg",
    heroGradient: { from: "#F6EFEB", to: "#EDE3DB" },
    accent: "#2C332F",
    sectionBg: "#F6EFEB",
    heroText: "#1A1E1A",
    heritage: { year: "Est. 1286", tagline: "GERMANY'S OLDEST WINE CELLAR · MOSEL", yearFont: "Cinzel", yearColor: "#2C332F" },
  },

  // ── Canmak ────────────────────────────────────────────────────────────────
  "Canmak": {
    heroBg: "/canmak-hero.png",
    heroGradient: { from: "#FAFAFA", to: "#FFF0F8" },
    accent: "#E8507A",
    sectionBg: "#FFFFFF",
    heroText: "#1A1A1A",
  },

  // ── Hydrodol ──────────────────────────────────────────────────────────────
  "Hydrodol": {
    heroBg: "/hydrodol-hero.jpg",
    heroGradient: { from: "#3A8FC9", to: "#C84B8F" },
    accent: "#3A8FC9",
    sectionBg: "#F0F8FF",
    heroText: "#ffffff",
  },

  "Morey-Coffinet": {
    heroBg: "/mc-vineyard.jpg",
    heroGradient: { from: "#0a0a0a", to: "#1a1a1a" },
    accent: "#C8A84B",
    sectionBg: "#f8f6f2",
    heroText: "#ffffff",
    feature: {
      label: "WINEMAKER · THIBAULT MOREY",
      heading: "From the Cave",
      body: "Thibault Morey works from the family cave in Chassagne-Montrachet, practising organic and biodynamic viticulture across their finest parcels. Low yields, hand harvesting and sensitive oak ageing allow each cru to express its distinctive limestone terroir with precision and purity.",
      image: "/mc-cellar.jpg",
      imageCaption: "Thibault Morey in the cave — Chassagne-Montrachet",
      visual: { bg: "#0a0a0a", line1: "Est.", line2: "c. 1980" },
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
      year: "Est. 1638",
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
