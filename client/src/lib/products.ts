export interface Rating {
  source: string;       // e.g. "James Halliday", "Wine Advocate", "Wine Spectator"
  score: number;        // e.g. 99
  maxScore: number;     // e.g. 100
  note?: string;        // short quote from the review
  year?: string;        // vintage reviewed
}

export interface MediaLink {
  type: "instagram" | "facebook" | "threads" | "youtube" | "article";
  url: string;
  label: string;        // display text
  thumbnail?: string;   // optional thumbnail URL
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  country: string;
  region: string;
  type: string;
  status: string;
  size: string;
  vintage: string;
  price: number;
  promo_price?: number;        // promotional / sale price (optional)
  price_display: string;
  description?: string;
  tasting_notes?: string;        // legacy field
  tasting_note?: string;         // new field from Excel
  food_pairing?: string;
  image_url?: string;
  // Rich product detail fields
  grape?: string;                // e.g. "Shiraz" (from Excel)
  grape_varietals?: string[];    // legacy array form
  phonetic?: string;             // pronunciation guide for French names
  style?: string;
  alcohol?: string;
  serve_temp?: string;
  cellaring?: string;
  winemaker_notes?: string;
  ratings?: Rating[];
  media_links?: MediaLink[];
  exclusive?: boolean;           // true = exclusive agency brand
}

export const WINE_TYPE_COLORS: Record<string, string> = {
  "Red": "badge-red",
  "White": "badge-white",
  "Sparkling": "badge-sparkling",
  "Sparkling Red": "badge-sparkling",
  "Champagne": "badge-champagne",
  "Rose": "badge-rose",
  "Fortified": "badge-fortified",
  "Makgeolli": "badge-magoli",
};

export const BRAND_INFO: Record<string, { country: string; description: string; website?: string }> = {
  "Mollydooker": {
    country: "Australia",
    description: "Mollydooker (Australian slang for 'left-hander') crafts powerful, lush wines from McLaren Vale. Renowned for their signature blue-bottle Velvet Glove Shiraz and exuberant fruit-driven style.",
    website: "https://mollydookerwines.com",
  },
  "Château de Saint Cosme": {
    country: "France · Gigondas, Rhône Valley",
    description: "Established in 1490, Château de Saint Cosme is the most celebrated estate in Gigondas and one of the Rhône Valley's oldest family domaines. Winemaker Louis Barruol, the 15th generation at the helm, combines deep respect for tradition with a visionary approach to terroir expression. The estate's ancient vines and limestone soils produce wines of remarkable depth, elegance, and minerality — benchmark examples that define the essence of Gigondas.\n\n創立於1490年的聖寇斯姆酒莊（Château de Saint Cosme），是吉攻達斯（Gigondas）最具代表性、亦是當地最傑出的酒莊。第十五代莊主兼釀酒師 Louis Barruol，以對風土的深刻理解與精細釀造手法，呈現出酒莊百年傳統的靈魂。莊園古老葡萄藤和石灰岩土壤孕育出層次豐富、優雅且礦物感鮮明的佳釀，成為南隆河產區品質與真誠的象徵。",
    website: "https://saintcosme.com",
  },
  "Morey-Coffinet": {
    country: "France",
    description: "A celebrated Burgundy domaine in Chassagne-Montrachet, crafting some of the finest Premier and Grand Cru white Burgundies. Restrained, mineral-driven Chardonnays of exceptional purity.",
    website: "https://www.morey-coffinet.com",
  },
  "Maison Morey-Coffinet": {
    country: "France",
    description: "The négociant arm of the renowned Morey Coffinet domaine, extending their Burgundian expertise to a wider range of acclaimed appellations.",
  },
  "Kopke": {
    country: "Portugal",
    description: "The world's oldest Port wine house, established in 1638. Kopke's Tawny Ports and rare Colheitas represent over 380 years of winemaking mastery in the Douro Valley.",
    website: "https://kopke1638.com",
  },
  "Realm Cellars": {
    country: "USA",
    description: "A cult Napa Valley producer crafting some of California's most sought-after wines. Realm's The Bard and single-vineyard reds command the highest critical acclaim.",
  },
  "Vereinigte Hospitien": {
    country: "Germany",
    description: "A legendary Mosel estate founded in 1804, producing exceptional Rieslings from world-class vineyards including Scharzhofberger. Centuries of tradition meet impeccable precision.",
    website: "https://www.weingut.vereinigtehospitien.de",
  },
  "Tscharke": {
    country: "Australia",
    description: "A boutique Barossa producer championing alternative Mediterranean varieties. Tscharke's Grenache and Montepulciano showcase the Barossa's ability to excel beyond Shiraz.",
  },
  "Sherwood": {
    country: "New Zealand",
    description: "Established in 1987 in Waipara Valley, Sherwood Estate crafts pure, elegant expressions of Pinot Noir and Sauvignon Blanc from one of New Zealand's most exciting cool-climate regions.",
    website: "https://www.sherwood.co.nz",
  },
  "Champagne Boizel": {
    country: "France",
    description: "A distinguished Champagne house since 1834, crafting elegant, fine-textured Champagnes. Boizel is celebrated for their consistency, refinement, and classic Champenois style.",
    website: "https://www.boizel.com",
  },
  "Crystallum": {
    country: "South Africa",
    description: "A benchmark South African producer from the Hemel-en-Aarde Valley, making world-class Chardonnay that rivals the finest Burgundy.",
  },
  "Levrier Wines by Jo Irvine": {
    country: "Australia",
    description: "Winemaker Jo Irvine crafts precise, single-vineyard expressions from the Barossa and Eden Valley. Fine, elegant wines that challenge Barossa's big-and-bold reputation.",
  },
  "Pasqua": {
    country: "Italy",
    description: "One of Italy's most innovative family wine producers, crafting vibrant Prosecco and Moscato d'Asti with exceptional freshness and approachability.",
  },
  "Canmak": {
    country: "Korea",
    description: "Korea's finest Makgeolli producer, offering traditional rice brew in refreshing modern formats — a unique, approachable alternative to wine.",
  },
  "Hydrodol": {
    country: "Australia",
    description: "HYDRODOL® is Australia's leading hangover prevention and wellness supplement brand, established in 2001 by Substance Pty Ltd. 100% Vegan, Australian-made supplements designed to support your body before, during and after a big night. Exclusively distributed in Hong Kong by Terroir & Craft Co., Ltd.",
    website: "https://www.hydrodolhongkong.com",
  },
};

export function getTypeBadgeClass(type: string): string {
  return WINE_TYPE_COLORS[type] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
}

export function formatPrice(price: number): string {
  return `HK$${price.toLocaleString()}`;
}
