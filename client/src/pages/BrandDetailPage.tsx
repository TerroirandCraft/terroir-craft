import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Globe, MapPin, Grape, Star, ChevronRight } from "lucide-react";
import type { Product } from "@/lib/products";
import { BRAND_INFO, formatPrice } from "@/lib/products";
import WineCard from "@/components/WineCard";

// Winery logo URLs — official winery websites / press kits
const BRAND_LOGOS: Record<string, string> = {
  "Mollydooker":               "https://mollydookerwines.com.au/wp-content/uploads/2019/01/mollydooker-logo.png",
  "Tscharke":                  "https://tscharke.au/cdn/shop/files/tscharke-logo.png",
  "Champagne Boizel":          "https://www.boizel.com/wp-content/uploads/2021/05/boizel-logo.png",
  "Château de Saint Cosme":    "https://winebow-files.s3.amazonaws.com/public/2023-04/st-cosme-logo.png",
  "Kopke":                     "https://kopke1638.com/wp-content/uploads/2022/03/kopke-logo.png",
  "Morey-Coffinet":            "https://www.morey-coffinet.com/media/cache/logo/logo.png",
  "Maison Morey-Coffinet":     "https://www.morey-coffinet.com/media/cache/logo/logo.png",
  "Vereinigte Hospitien":      "https://www.weingut.vereinigtehospitien.de/images/logo.png",
  "Sherwood":                  "https://www.sherwood.co.nz/assets/images/sherwood-logo.png",
  "Levrier Wines by Jo Irvine":"https://images.wineselectors.com.au/media/brand/LEVRI-logo.png",
  "Realm Cellars":             "https://realmcellars.com/wp-content/uploads/2022/01/realm-logo-black.png",
  "Pasqua":                    "https://www.pasqua.it/wp-content/themes/pasqua/assets/images/logo.png",
  "Canmak":                    "https://www.canmak.com/assets/images/logo.png",
  "Carinena":                  "https://www.carinena.com/wp-content/uploads/2020/04/logo-carinena.png",
  "Tierra de Cubas":           "https://www.tierradecubas.com/images/logo.png",
  "TEMPERAMENT":               "https://www.tscharke.com.au/media/logo/default/temperament-logo.png",
  "CF EMPRESS":                "https://images.vivino.com/users/cfempress/logo.png",
};

// Hero/banner image for each brand (vineyard/winery atmosphere shots)
const BRAND_HERO: Record<string, string> = {
  "Mollydooker":               "https://mollydookerwines.com.au/wp-content/uploads/2019/06/mollydooker-vineyard.jpg",
  "Tscharke":                  "https://tscharke.au/cdn/shop/files/tscharke-vineyard.jpg",
  "Champagne Boizel":          "https://www.boizel.com/wp-content/uploads/2021/05/boizel-cellar.jpg",
  "Château de Saint Cosme":    "https://winebow-files.s3.amazonaws.com/public/2023-04/st-cosme-estate.jpg",
  "Kopke":                     "https://kopke1638.com/wp-content/uploads/2022/03/kopke-douro.jpg",
  "Morey-Coffinet":            "https://www.morey-coffinet.com/media/cache/hero/vineyard.jpg",
  "Vereinigte Hospitien":      "https://www.weingut.vereinigtehospitien.de/images/vineyard.jpg",
  "Realm Cellars":             "https://realmcellars.com/wp-content/uploads/2022/01/realm-vineyard.jpg",
};

function BrandHero({ brand, info }: { brand: string; info: typeof BRAND_INFO[string] | undefined }) {
  // Derive a colour per brand region
  const heroColors: Record<string, { from: string; to: string }> = {
    "Mollydooker":               { from: "#1a0a2e", to: "#3B1F5E" },
    "Tscharke":                  { from: "#2C1A0E", to: "#6B3A1F" },
    "Champagne Boizel":          { from: "#1C1708", to: "#5C4A10" },
    "Château de Saint Cosme":    { from: "#1A0D0D", to: "#6B1A1A" },
    "Kopke":                     { from: "#1A0A00", to: "#6B2200" },
    "Morey-Coffinet":            { from: "#0D1A10", to: "#1A4A2A" },
    "Maison Morey-Coffinet":     { from: "#0D1A10", to: "#1A4A2A" },
    "Vereinigte Hospitien":      { from: "#0A1A2A", to: "#1A3A5A" },
    "Sherwood":                  { from: "#0A1E10", to: "#1A4A20" },
    "Levrier Wines by Jo Irvine":{ from: "#1E1008", to: "#5A2A10" },
    "Realm Cellars":             { from: "#0A0A1E", to: "#1A1A5A" },
  };
  const colors = heroColors[brand] || { from: "#1A0D0D", to: "#6B2233" };

  return (
    <div
      className="relative py-16 px-6 overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)` }}
    >
      {/* Subtle texture overlay */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}
      />

      <div className="max-w-6xl mx-auto relative">
        {/* Back button */}
        <Link href="/brands">
          <a className="inline-flex items-center gap-1.5 text-white/60 hover:text-white font-body text-sm mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> All Brands
          </a>
        </Link>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
          {/* Logo box */}
          <div className="w-28 h-28 md:w-36 md:h-36 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 flex items-center justify-center shrink-0 overflow-hidden">
            <img
              src={BRAND_LOGOS[brand]}
              alt={`${brand} logo`}
              className="w-full h-full object-contain p-4"
              onError={(e) => {
                // Fallback: show brand initials
                const el = e.currentTarget;
                el.style.display = 'none';
                el.parentElement!.innerHTML = `<span class="font-display text-3xl font-bold text-white/80">${brand.substring(0,2).toUpperCase()}</span>`;
              }}
            />
          </div>

          {/* Brand info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-sm bg-amber-500/20 border border-amber-400/40 text-amber-300 font-body text-xs font-semibold tracking-widest uppercase">
                <Star className="w-3 h-3 fill-amber-300" /> Exclusive Agency
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-light text-white mb-3 leading-tight">
              {brand}
            </h1>
            {info?.country && (
              <div className="flex items-center gap-1.5 text-white/60 font-body text-sm mb-4">
                <MapPin className="w-3.5 h-3.5" /> {info.country}
                {info.website && (
                  <>
                    <span className="mx-2 text-white/30">·</span>
                    <a href={info.website} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-amber-300/80 hover:text-amber-300 transition-colors">
                      <Globe className="w-3.5 h-3.5" /> Official Website
                    </a>
                  </>
                )}
              </div>
            )}
            {info?.description && (
              <p className="font-body text-white/75 text-base leading-relaxed max-w-2xl">
                {info.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BrandDetailPage() {
  const { brand: brandSlug } = useParams<{ brand: string }>();
  const brand = decodeURIComponent(brandSlug || "");

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const brandProducts = products.filter(
    p => p.brand.toLowerCase() === brand.toLowerCase()
  );

  const info = BRAND_INFO[brand];

  // Derive actual brand name from products if URL slug differs slightly
  const actualBrand = brandProducts[0]?.brand || brand;

  // Group products by type
  const byType: Record<string, Product[]> = {};
  brandProducts.forEach(p => {
    const t = p.type || "Other";
    if (!byType[t]) byType[t] = [];
    byType[t].push(p);
  });

  const typeOrder = ["Red", "White", "Sparkling", "Champagne", "Sparkling Red", "Rose", "Fortified", "Makgeolli", "Other"];
  const sortedTypes = Object.keys(byType).sort((a, b) => {
    const ai = typeOrder.indexOf(a);
    const bi = typeOrder.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground font-body text-sm">Loading...</div>
      </div>
    );
  }

  if (brandProducts.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <Link href="/brands">
            <a className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-body text-sm mb-8">
              <ArrowLeft className="w-4 h-4" /> Back to Brands
            </a>
          </Link>
          <p className="font-body text-muted-foreground">Brand not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <BrandHero brand={actualBrand} info={info} />

      {/* Stats bar */}
      <div className="border-b border-border bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap gap-6">
          <div className="font-body text-sm">
            <span className="text-muted-foreground">{actualBrand === "Hydrodol" ? "Products available" : "Wines available"}</span>
            <span className="ml-2 font-semibold text-foreground">{brandProducts.length}</span>
          </div>
          {Object.entries(byType).map(([type, items]) => (
            <div key={type} className="font-body text-sm">
              <span className="text-muted-foreground">{type}</span>
              <span className="ml-1.5 font-semibold text-foreground">{items.length}</span>
            </div>
          ))}
          <div className="font-body text-sm">
            <span className="text-muted-foreground">From</span>
            <span className="ml-2 font-semibold text-foreground">
              {formatPrice(Math.min(...brandProducts.map(p => p.price).filter(p => p > 0)))}
            </span>
          </div>
        </div>
      </div>

      {/* Wine grid — grouped by type */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        {sortedTypes.map(type => (
          <section key={type}>
            <div className="flex items-center gap-3 mb-5">
              <h2 className="font-display text-xl font-medium text-foreground">{actualBrand === "Hydrodol" ? type : `${type} Wines`}</h2>
              <div className="flex-1 h-px bg-border" />
              <span className="font-body text-xs text-muted-foreground">{byType[type].length} {actualBrand === "Hydrodol" ? (byType[type].length === 1 ? 'product' : 'products') : (byType[type].length === 1 ? 'wine' : 'wines')}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {byType[type]
                .sort((a, b) => {
                  // Sort by vintage desc, then name
                  const av = parseInt(a.vintage) || 0;
                  const bv = parseInt(b.vintage) || 0;
                  if (bv !== av) return bv - av;
                  return a.name.localeCompare(b.name);
                })
                .map(product => (
                  <WineCard key={product.id} product={product} />
                ))
              }
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
