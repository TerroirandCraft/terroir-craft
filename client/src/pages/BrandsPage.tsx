import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Globe, ChevronRight, Star } from "lucide-react";
import type { Product } from "@/lib/products";
import { BRAND_INFO, formatPrice } from "@/lib/products";
import { API_BASE } from "@/lib/queryClient";

// Brand logo filenames — place files in /client/public/brand-logos/<BrandName>.jpg (or .png)
// Add entries here as logos are uploaded
const BRAND_LOGO_FILES: Record<string, string> = {
  "Mollydooker": "Mollydooker.webp",
  "Canmak": "Canmak.jpeg",
  "Champagne Boizel": "Champagne Boizel.jpeg",
  "Château d'Issan": "Chateau D'Issan.png",
  "Château de Saint Cosme": "Chateau de Saint Cosme.jpg",
  "Crystallum": "Crystallum.png",
  "Kopke": "Kopke.jpg",
  "La Dame de Montrose": "La Dame de Montrose.png",
  "Le Baron de Brane": "Le Baron de Brane.png",
  "Les Pagodes de Cos": "Les Pagodes de Cos.jpeg",
  "Levrier Wines by Jo Irvine": "Levrier Wines by Jo Irvine.webp",
  "Maison Morey-Coffinet": "Morey Coffinet.png",
  "Morey-Coffinet": "Morey Coffinet.png",
  "Pasqua": "Pasqua.png",
  "Realm Cellars": "Realm Cellars.webp",
  "Sherwood": "Sherwood.jpg",
  "Tierra de Cubas": "Tierra de Cubas.png",
  "Tscharke": "Tscharke.png",
  "Vereinigte Hospitien": "Vereinigte Hospitien.webp",
  "Hydrodol": "Hydrodol.jpg",
};

function BrandLogo({ brand, exclusive }: { brand: string; exclusive: boolean }) {
  const file = BRAND_LOGO_FILES[brand];
  const initials = brand.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase();

  if (file) {
    return (
      <div className={`w-14 h-14 rounded-lg border flex items-center justify-center overflow-hidden shrink-0 bg-white ${exclusive ? "border-amber-200" : "border-border"}`}>
        <img
          src={`${API_BASE}/brand-logos/${file}`}
          alt={`${brand} logo`}
          className="w-full h-full object-contain p-1.5"
          onError={(e) => {
            const el = e.currentTarget;
            el.style.display = "none";
            const parent = el.parentElement!;
            parent.innerHTML = `<span class="font-display text-base font-bold text-muted-foreground">${initials}</span>`;
          }}
        />
      </div>
    );
  }

  // Placeholder — grey box with initials, ready for logo upload
  return (
    <div className={`w-14 h-14 rounded-lg border flex items-center justify-center shrink-0 bg-muted/50 ${exclusive ? "border-amber-200" : "border-border"}`}>
      <span className="font-display text-base font-bold text-muted-foreground/50">{initials}</span>
    </div>
  );
}

export default function BrandsPage() {
  const [filter, setFilter] = useState<"all" | "exclusive" | "open">("all");

  const { data: products = [] } = useQuery<Product[]>({ queryKey: ["/api/products"] });

  // Build brand map with exclusive flag
  const brandMap: Record<string, { products: Product[]; exclusive: boolean }> = {};
  products.forEach(p => {
    if (!brandMap[p.brand]) brandMap[p.brand] = { products: [], exclusive: !!p.exclusive };
    brandMap[p.brand].products.push(p);
  });

  // Sort: exclusive first, then alphabetical within each group
  const allBrands = Object.keys(brandMap);
  const exclusiveBrands = allBrands.filter(b => brandMap[b].exclusive).sort();
  const openBrands = allBrands.filter(b => !brandMap[b].exclusive).sort();
  const sortedBrands = [...exclusiveBrands, ...openBrands];

  const visibleBrands = sortedBrands.filter(b => {
    if (filter === "exclusive") return brandMap[b].exclusive;
    if (filter === "open") return !brandMap[b].exclusive;
    return true;
  });

  const exclusiveCount = exclusiveBrands.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-[hsl(355,62%,28%)] text-white py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <p className="font-body text-xs tracking-[0.2em] uppercase text-white/60 mb-3">Our Portfolio</p>
          <h1 className="font-display text-4xl md:text-5xl font-light mb-2">Brands 品牌</h1>
          <p className="font-body text-white/70 text-sm">
            {allBrands.length} brands · {exclusiveCount} exclusive agency · from 10 countries
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Filter tabs */}
        <div className="flex gap-2 mb-8">
          {(["all", "exclusive", "open"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              data-testid={`filter-${f}`}
              className={`px-4 py-1.5 rounded-full font-body text-xs font-medium border transition-all ${
                filter === f
                  ? f === "exclusive"
                    ? "bg-amber-600 border-amber-600 text-white"
                    : "bg-[hsl(355,62%,28%)] border-[hsl(355,62%,28%)] text-white"
                  : "border-border text-muted-foreground hover:border-foreground/30"
              }`}
            >
              {f === "all" ? "All Brands" : f === "exclusive" ? "★ Exclusive Agency" : "Other Brands"}
            </button>
          ))}
        </div>

        {/* Section label for exclusive brands */}
        {(filter === "all" || filter === "exclusive") && (
          <div className="flex items-center gap-3 mb-4">
            <span className="font-body text-xs font-semibold tracking-[0.15em] uppercase text-amber-700">
              ★ Exclusive Agency Brands
            </span>
            <div className="flex-1 h-px bg-amber-200" />
            <span className="font-body text-xs text-amber-600 font-medium">{exclusiveBrands.length} brands</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {visibleBrands.map((brand, idx) => {
            const { products: brandProducts, exclusive } = brandMap[brand];
            const info = BRAND_INFO[brand];
            const countries = [...new Set(brandProducts.map(p => p.country))];

            // Inject "Other Brands" section divider
            const prevBrand = idx > 0 ? visibleBrands[idx - 1] : null;
            const showOpenDivider =
              filter === "all" &&
              !brandMap[brand].exclusive &&
              (prevBrand === null || brandMap[prevBrand].exclusive);

            return (
              <div key={brand} className="contents">
                {showOpenDivider && (
                  <div className="col-span-full flex items-center gap-3 mt-4 mb-2">
                    <span className="font-body text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground">
                      Other Brands
                    </span>
                    <div className="flex-1 h-px bg-border" />
                    <span className="font-body text-xs text-muted-foreground font-medium">{openBrands.length} brands</span>
                  </div>
                )}

                <Link href={`/brands/${encodeURIComponent(brand)}`}>
                  <a
                    data-testid={`brand-${brand.replace(/\s/g, "-").toLowerCase()}`}
                    className={`block bg-card border rounded-xl overflow-hidden transition-all duration-200 hover:shadow-md card-hover ${
                      exclusive ? "hover:border-amber-400" : "hover:border-[hsl(355,62%,28%)]"
                    } border-border`}
                  >
                    <div className="p-5">
                      {/* Top row: logo + brand info + chevron */}
                      <div className="flex items-start gap-4">
                        <BrandLogo brand={brand} exclusive={exclusive} />

                        <div className="flex-1 min-w-0">
                          {/* Exclusive badge */}
                          {exclusive && (
                            <div className="flex items-center gap-1.5 mb-1.5">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-amber-600 text-white font-body text-[10px] font-semibold tracking-[0.08em] uppercase">
                                <Star className="w-2.5 h-2.5 fill-white" />
                                Exclusive
                              </span>
                            </div>
                          )}
                          <h2 className="font-display text-base font-medium text-foreground mb-1 leading-tight">{brand}</h2>
                          <div className="flex flex-wrap gap-2 items-center">
                            {countries.map(c => (
                              <span key={c} className="font-body text-xs text-muted-foreground flex items-center gap-1">
                                <Globe className="w-3 h-3" /> {c}
                              </span>
                            ))}
                            <span className="font-body text-xs text-[hsl(355,62%,28%)] font-medium">
                              {brandProducts.length} {brand === "Hydrodol" ? "products" : "wines"}
                            </span>
                          </div>
                        </div>

                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                      </div>

                      {info?.description && (
                        <p className="font-body text-sm text-muted-foreground mt-3 leading-relaxed line-clamp-2">
                          {info.description}
                        </p>
                      )}
                    </div>
                  </a>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
