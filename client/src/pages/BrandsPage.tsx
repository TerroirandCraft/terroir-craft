import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Globe, Star } from "lucide-react";
import type { Product } from "@/lib/products";
import { BRAND_INFO, formatPrice } from "@/lib/products";
import { API_BASE } from "@/lib/queryClient";

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
  "The Marlborist": "The Marlborist.jpg",
  "Arillo in Terrabianca": "Arillo in Terrabianca.jpg",
  "Tenuta di Ciclopi": "Tenuta di Ciclopi.jpg",
  "La Maliosa": "La Maliosa.jpg",
  "Clos Bellane": "Clos Bellane.jpg",
  "Cape Swallow": "Cape Swallow.jpg",
  "La Manufacture": "La Manufacture.jpg",
  "Chateau Mihope": "Chateau Mihope.jpg",
  "La Grange de l'Oncle Charles": "La Grange de l'Oncle Charles.jpg",
  "Maison A&S": "Maison A&S.jpg",
  "Domaine La Grapp'A": "Domaine La Grapp'A.jpg",
  "Jean-Baptiste Hardy": "Jean-Baptiste Hardy.jpg",
  "Domaine Les Aricoques": "Domaine Les Aricoques.jpg",
  "Maison Pommier": "Maison Pommier.jpg",
  "Domaine 7": "Domaine 7.jpg",
};

// Country → flagcdn 2-letter code
const COUNTRY_FLAG: Record<string, string> = {
  "France": "fr", "Australia": "au", "USA": "us", "Italy": "it",
  "Germany": "de", "Portugal": "pt", "Spain": "es", "New Zealand": "nz",
  "South Korea": "kr", "Korea": "kr", "Japan": "jp", "South Africa": "za",
};

function CountryFlag({ country }: { country: string }) {
  // Extract base country (strip sub-region after ·)
  const base = country.split("·")[0].trim();
  const code = COUNTRY_FLAG[base];
  if (code) {
    return (
      <span className="inline-flex items-center gap-1.5 font-body text-xs text-muted-foreground">
        <img
          src={`https://flagcdn.com/20x15/${code}.png`}
          width={20} height={15}
          alt={base}
          style={{ borderRadius: 2, verticalAlign: "middle" }}
        />
        {base}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 font-body text-xs text-muted-foreground">
      <Globe className="w-3 h-3" />{base}
    </span>
  );
}

function BrandCard({ brand, products, exclusive }: { brand: string; products: Product[]; exclusive: boolean }) {
  const file = BRAND_LOGO_FILES[brand];
  const info = BRAND_INFO[brand];
  const initials = brand.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase();
  const country = info?.country || products[0]?.country || "";
  const minPrice = Math.min(...products.map(p => p.promo_price || p.price).filter(p => p > 0));
  const wineCount = products.length;

  return (
    <Link href={`/brands/${encodeURIComponent(brand)}`}>
      <a className={`group block bg-white rounded-2xl overflow-hidden transition-all duration-200
        hover:-translate-y-1 hover:shadow-xl
        ${exclusive
          ? "border border-amber-200 shadow-sm shadow-amber-100"
          : "border border-gray-100 shadow-sm"}`}
        style={{ textDecoration: "none" }}
      >
        {/* Logo area — tall, centered */}
        <div
          className="relative flex items-center justify-center bg-gray-50"
          style={{ height: 160 }}
        >
          {exclusive && (
            <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-body font-semibold"
              style={{ background: "#c8a050", color: "#fff", fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              <Star className="w-2.5 h-2.5" style={{ fill: "white" }} />
              Exclusive Agency
            </span>
          )}
          {file ? (
            <img
              src={`${API_BASE}/brand-logos/${file}`}
              alt={`${brand} logo`}
              className="max-h-24 max-w-[80%] object-contain transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <span className="font-display text-3xl font-bold text-gray-300">{initials}</span>
          )}
        </div>

        {/* Info area */}
        <div className="px-5 py-4 border-t border-gray-100">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h2 className="font-display text-base font-medium text-gray-900 leading-snug"
              style={{ fontStyle: "italic" }}>
              {brand}
            </h2>
            <svg className="w-4 h-4 text-gray-300 shrink-0 mt-0.5 group-hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3">
            <CountryFlag country={country} />
            <span className="font-body text-xs font-medium" style={{ color: "hsl(355,62%,28%)" }}>
              {wineCount} {brand === "Hydrodol" || brand === "Canmak" ? "products" : "wines"}
            </span>
            {minPrice > 0 && (
              <span className="font-body text-xs text-gray-400">
                From HK${minPrice.toLocaleString()}
              </span>
            )}
          </div>

          {info?.description && (
            <p className="font-body text-xs text-gray-400 leading-relaxed line-clamp-2">
              {info.description.split("\n")[0]}
            </p>
          )}
        </div>
      </a>
    </Link>
  );
}

// Country filter pills
const COUNTRY_FILTERS = [
  "All", "France", "Australia", "Italy", "Germany", "Portugal", "New Zealand", "USA", "Korea", "Japan", "South Africa", "Spain",
];

export default function BrandsPage() {
  const [countryFilter, setCountryFilter] = useState("All");
  const [exclusiveOnly, setExclusiveOnly] = useState(false);

  const { data: products = [] } = useQuery<Product[]>({ queryKey: ["/api/products"] });

  const brandMap: Record<string, { products: Product[]; exclusive: boolean }> = {};
  products.forEach(p => {
    if (!brandMap[p.brand]) brandMap[p.brand] = { products: [], exclusive: !!p.exclusive };
    brandMap[p.brand].products.push(p);
    if (p.exclusive) brandMap[p.brand].exclusive = true;
  });

  // Priority order for exclusive brands
  const EXCLUSIVE_ORDER = [
    "Mollydooker",
    "Realm Cellars",
    "Château de Saint Cosme",
    "Champagne Boizel",
    "Morey-Coffinet",
    "Vereinigte Hospitien",
    "Kopke",
    "Tscharke",
    "Sherwood",
  ];

  const allExclusive = Object.keys(brandMap).filter(b => brandMap[b].exclusive);
  const exclusiveBrands = [
    ...EXCLUSIVE_ORDER.filter(b => allExclusive.includes(b)),
    ...allExclusive.filter(b => !EXCLUSIVE_ORDER.includes(b)).sort(),
  ];
  const openBrands = Object.keys(brandMap).filter(b => !brandMap[b].exclusive).sort();
  const allBrands = [...exclusiveBrands, ...openBrands];

  // Filter
  const filtered = allBrands.filter(b => {
    const info = BRAND_INFO[b];
    const country = (info?.country || brandMap[b].products[0]?.country || "").split("·")[0].trim();
    if (exclusiveOnly && !brandMap[b].exclusive) return false;
    if (countryFilter !== "All" && !country.includes(countryFilter)) return false;
    return true;
  });

  const exclusiveFiltered = filtered.filter(b => brandMap[b].exclusive);
  const openFiltered = filtered.filter(b => !brandMap[b].exclusive);

  return (
    <div className="min-h-screen" style={{ background: "#f5f3ef" }}>
      {/* Hero */}
      <div style={{ background: "hsl(355,62%,28%)", padding: "48px 24px 40px" }}>
        <div className="max-w-7xl mx-auto">
          <p className="font-body text-xs tracking-[0.2em] uppercase mb-3" style={{ color: "rgba(255,255,255,0.5)" }}>Our Portfolio</p>
          <h1 className="font-display mb-2" style={{ fontSize: "clamp(2rem,4vw,3rem)", color: "#fff" }}>
            Exclusive Brands
          </h1>
          <p className="font-body text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
            Handpicked estates and producers from the world's finest wine regions.
          </p>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 mt-6">
            {[
              { n: allBrands.length, l: "Total Brands" },
              { n: exclusiveBrands.length, l: "Exclusive Agency" },
              { n: [...new Set(products.map(p => p.country?.split("·")[0].trim()))].length, l: "Countries" },
            ].map(({ n, l }) => (
              <div key={l}>
                <div className="font-display text-2xl font-light" style={{ color: "#fff" }}>{n}</div>
                <div className="font-body text-xs tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.45)" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Filters row */}
        <div className="flex flex-wrap gap-2 mb-6 items-center">
          {/* Exclusive toggle */}
          <button
            onClick={() => setExclusiveOnly(!exclusiveOnly)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-xs font-semibold transition-all"
            style={{
              background: exclusiveOnly ? "#c8a050" : "white",
              color: exclusiveOnly ? "white" : "#6b6760",
              border: `1px solid ${exclusiveOnly ? "#c8a050" : "#e2ded7"}`,
            }}
          >
            <Star className="w-3 h-3" style={{ fill: exclusiveOnly ? "white" : "none" }} />
            Exclusive Only
          </button>

          <div className="w-px h-5 bg-gray-200 mx-1" />

          {/* Country filters */}
          {COUNTRY_FILTERS.map(c => {
            const code = COUNTRY_FLAG[c];
            const active = countryFilter === c;
            // Check if this country has brands
            const hasbrands = c === "All" || allBrands.some(b => {
              const info = BRAND_INFO[b];
              const country = (info?.country || brandMap[b].products[0]?.country || "").split("·")[0].trim();
              return country.includes(c);
            });
            if (!hasbrands) return null;
            return (
              <button
                key={c}
                onClick={() => setCountryFilter(c)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body text-xs transition-all"
                style={{
                  background: active ? "hsl(355,62%,28%)" : "white",
                  color: active ? "white" : "#6b6760",
                  border: `1px solid ${active ? "hsl(355,62%,28%)" : "#e2ded7"}`,
                }}
              >
                {code && <img src={`https://flagcdn.com/16x12/${code}.png`} width={16} height={12} alt={c} style={{ borderRadius: 1 }} />}
                {c}
              </button>
            );
          })}
        </div>

        {/* Exclusive brands */}
        {exclusiveFiltered.length > 0 && (
          <section className="mb-10">
            {!exclusiveOnly && (
              <div className="flex items-center gap-3 mb-5">
                <span className="font-body text-xs font-semibold tracking-[0.15em] uppercase" style={{ color: "#c8a050" }}>
                  ★ Exclusive Agency Brands
                </span>
                <div className="flex-1 h-px" style={{ background: "#e8d9b0" }} />
                <span className="font-body text-xs font-medium" style={{ color: "#c8a050" }}>{exclusiveFiltered.length} brands</span>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
              {exclusiveFiltered.map(b => (
                <BrandCard key={b} brand={b} products={brandMap[b].products} exclusive={true} />
              ))}
            </div>
          </section>
        )}

        {/* Other brands */}
        {openFiltered.length > 0 && !exclusiveOnly && (
          <section>
            <div className="flex items-center gap-3 mb-5">
              <span className="font-body text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground">
                Other Brands
              </span>
              <div className="flex-1 h-px bg-gray-200" />
              <span className="font-body text-xs font-medium text-muted-foreground">{openFiltered.length} brands</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
              {openFiltered.map(b => (
                <BrandCard key={b} brand={b} products={brandMap[b].products} exclusive={false} />
              ))}
            </div>
          </section>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="font-body text-muted-foreground">No brands found for this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
